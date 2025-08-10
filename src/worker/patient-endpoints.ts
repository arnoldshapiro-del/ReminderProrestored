import { Hono } from "hono";

const patientRoutes = new Hono<{ Bindings: Env }>();

// Helper function to get user from context
async function getUserFromContext(c: any): Promise<any> {
  const user = c.get("user");
  // Fallback for anonymous users during testing
  if (!user) {
    return { id: 'anonymous_user_temp' };
  }
  return user;
}

// Patient preferences endpoints - SIMPLE approach
patientRoutes.get("/:id/preferences", async (c) => {
  try {
    await getUserFromContext(c);
    const patientId = c.req.param('id');
    
    // For testing - be more permissive with patient lookup
    const patient = await c.env.DB.prepare(
      "SELECT id FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const preferences = await c.env.DB.prepare(
      "SELECT * FROM patient_preferences WHERE patient_id = ?"
    ).bind(patientId).first();
    
    if (!preferences) {
      // Return default preferences
      return c.json({
        patient_id: parseInt(patientId),
        preferred_channel: 'sms',
        preferred_time_start: '09:00',
        preferred_time_end: '18:00',
        timezone: 'America/New_York',
        language_code: 'en',
        max_reminders_per_day: 3,
        emergency_contact_allowed: true,
        reminder_send_time: '10:00',
        reminder_4_days: true,
        reminder_3_days: true,
        reminder_2_days: true,
        reminder_1_day: true,
        reminder_day_of: true
      });
    }
    
    return c.json(preferences);
  } catch (error) {
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

patientRoutes.post("/:id/preferences", async (c) => {
  try {
    await getUserFromContext(c);
    const patientId = c.req.param('id');
    const data = await c.req.json();
    
    // For testing - be more permissive with patient lookup  
    const patient = await c.env.DB.prepare(
      "SELECT id FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    // Check if preferences exist
    const existing = await c.env.DB.prepare(
      "SELECT id FROM patient_preferences WHERE patient_id = ?"
    ).bind(patientId).first();
    
    if (existing) {
      // Update existing preferences
      const result = await c.env.DB.prepare(`
        UPDATE patient_preferences 
        SET preferred_channel = ?, preferred_time_start = ?, preferred_time_end = ?, 
            timezone = ?, language_code = ?, do_not_disturb_start = ?, do_not_disturb_end = ?,
            max_reminders_per_day = ?, emergency_contact_allowed = ?,
            reminder_send_time = ?, reminder_4_days = ?, reminder_3_days = ?,
            reminder_2_days = ?, reminder_1_day = ?, reminder_day_of = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `).bind(
        data.preferred_channel || 'sms',
        data.preferred_time_start || '09:00',
        data.preferred_time_end || '18:00',
        data.timezone || 'America/New_York',
        data.language_code || 'en',
        data.do_not_disturb_start || null,
        data.do_not_disturb_end || null,
        data.max_reminders_per_day || 3,
        data.emergency_contact_allowed ? 1 : 0,
        data.reminder_send_time || '10:00',
        data.reminder_4_days ? 1 : 0,
        data.reminder_3_days ? 1 : 0,
        data.reminder_2_days ? 1 : 0,
        data.reminder_1_day ? 1 : 0,
        data.reminder_day_of ? 1 : 0,
        patientId
      ).run();
      
      if (result.success) {
        return c.json({ success: true, ...data, id: (existing as any).id, patient_id: parseInt(patientId) });
      } else {
        return c.json({ error: "Failed to update preferences" }, 500);
      }
    } else {
      // Create new preferences
      const result = await c.env.DB.prepare(`
        INSERT INTO patient_preferences (
          patient_id, preferred_channel, preferred_time_start, preferred_time_end,
          timezone, language_code, do_not_disturb_start, do_not_disturb_end,
          max_reminders_per_day, emergency_contact_allowed,
          reminder_send_time, reminder_4_days, reminder_3_days,
          reminder_2_days, reminder_1_day, reminder_day_of
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        patientId,
        data.preferred_channel || 'sms',
        data.preferred_time_start || '09:00',
        data.preferred_time_end || '18:00',
        data.timezone || 'America/New_York',
        data.language_code || 'en',
        data.do_not_disturb_start || null,
        data.do_not_disturb_end || null,
        data.max_reminders_per_day || 3,
        data.emergency_contact_allowed ? 1 : 0,
        data.reminder_send_time || '10:00',
        data.reminder_4_days ? 1 : 0,
        data.reminder_3_days ? 1 : 0,
        data.reminder_2_days ? 1 : 0,
        data.reminder_1_day ? 1 : 0,
        data.reminder_day_of ? 1 : 0
      ).run();
      
      if (result.success) {
        return c.json({ success: true, ...data, id: result.meta.last_row_id, patient_id: parseInt(patientId) });
      } else {
        return c.json({ error: "Failed to create preferences" }, 500);
      }
    }
  } catch (error) {
    return c.json({ error: 'Failed to save preferences' }, 500);
  }
});

// Bulk update reminder times for multiple patients
patientRoutes.post('/bulk-reminder-times', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const data = await c.req.json();
    const { send_time, patient_ids } = data;

    if (!send_time) {
      return c.json({ error: 'Send time is required' }, 400);
    }

    let updatedCount = 0;

    if (patient_ids && patient_ids.length > 0) {
      // Update specific patients
      for (const patientId of patient_ids) {
        // Verify patient belongs to user
        const patient = await c.env.DB.prepare(
          'SELECT id FROM patients WHERE id = ? AND (user_id = ? OR user_id LIKE "anonymous_user_%")'
        ).bind(patientId, user.id).first();
        
        if (!patient) continue;

        // Check if preferences exist
        const existing = await c.env.DB.prepare(`
          SELECT id FROM patient_preferences WHERE patient_id = ?
        `).bind(patientId).first();

        if (existing) {
          await c.env.DB.prepare(`
            UPDATE patient_preferences SET 
              reminder_send_time = ?, updated_at = CURRENT_TIMESTAMP
            WHERE patient_id = ?
          `).bind(send_time, patientId).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO patient_preferences (
              patient_id, reminder_send_time, preferred_channel, preferred_time_start,
              preferred_time_end, timezone, language_code, max_reminders_per_day,
              emergency_contact_allowed, reminder_4_days, reminder_3_days,
              reminder_2_days, reminder_1_day, reminder_day_of
            ) VALUES (?, ?, 'sms', '09:00', '18:00', 'America/New_York', 'en', 3, 1, 1, 1, 1, 1, 1)
          `).bind(patientId, send_time).run();
        }
        updatedCount++;
      }
    } else {
      // Update all patients for this user
      const patients = await c.env.DB.prepare(
        'SELECT id FROM patients WHERE user_id = ? OR user_id LIKE "anonymous_user_%"'
      ).bind(user.id).all();

      for (const patient of (patients.results || [])) {
        const patientId = (patient as any).id;
        
        const existing = await c.env.DB.prepare(`
          SELECT id FROM patient_preferences WHERE patient_id = ?
        `).bind(patientId).first();

        if (existing) {
          await c.env.DB.prepare(`
            UPDATE patient_preferences SET 
              reminder_send_time = ?, updated_at = CURRENT_TIMESTAMP
            WHERE patient_id = ?
          `).bind(send_time, patientId).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO patient_preferences (
              patient_id, reminder_send_time, preferred_channel, preferred_time_start,
              preferred_time_end, timezone, language_code, max_reminders_per_day,
              emergency_contact_allowed, reminder_4_days, reminder_3_days,
              reminder_2_days, reminder_1_day, reminder_day_of
            ) VALUES (?, ?, 'sms', '09:00', '18:00', 'America/New_York', 'en', 3, 1, 1, 1, 1, 1, 1)
          `).bind(patientId, send_time).run();
        }
        updatedCount++;
      }
    }

    return c.json({ success: true, updated_count: updatedCount });
  } catch (error) {
    // Error bulk updating reminder times
    return c.json({ error: 'Failed to bulk update reminder times' }, 500);
  }
});

export default patientRoutes;
