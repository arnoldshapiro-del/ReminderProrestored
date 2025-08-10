import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const reminderSettingsRoutes = new Hono<{ Bindings: Env }>();

// Helper function to get user from context
async function getUserFromContext(c: any): Promise<any> {
  const user = c.get("user");
  if (!user) {
    return { id: 'anonymous_user_' + Date.now() };
  }
  return user;
}

// Validation schema for reminder settings
const reminderSettingsSchema = z.object({
  send_4_days_before: z.boolean().default(true),
  send_3_days_before: z.boolean().default(true),
  send_2_days_before: z.boolean().default(true),
  send_1_day_before: z.boolean().default(true),
  send_day_of: z.boolean().default(true),
  send_time_4_days: z.string().default('10:00'),
  send_time_3_days: z.string().default('10:00'),
  send_time_2_days: z.string().default('10:00'),
  send_time_1_day: z.string().default('10:00'),
  send_time_day_of: z.string().default('09:00'),
  reminder_message: z.string().optional()
});

// Get global reminder settings for user
reminderSettingsRoutes.get('/global', async (c) => {
  try {
    const user = await getUserFromContext(c);
    
    const settings = await c.env.DB.prepare(`
      SELECT * FROM appointment_reminder_settings 
      WHERE user_id = ? AND appointment_id IS NULL AND patient_id IS NULL
      ORDER BY created_at DESC LIMIT 1
    `).bind(user.id).first();

    if (!settings) {
      // Return default settings
      return c.json({
        send_4_days_before: true,
        send_3_days_before: true,
        send_2_days_before: true,
        send_1_day_before: true,
        send_day_of: true,
        send_time_4_days: '10:00',
        send_time_3_days: '10:00',
        send_time_2_days: '10:00',
        send_time_1_day: '10:00',
        send_time_day_of: '09:00'
      });
    }

    return c.json(settings);
  } catch (error) {
    return c.json({ error: 'Failed to fetch reminder settings' }, 500);
  }
});

// Save global reminder settings
reminderSettingsRoutes.post('/global', zValidator('json', reminderSettingsSchema), async (c) => {
  try {
    const user = await getUserFromContext(c);
    const data = c.req.valid('json');

    // Check if global settings exist
    const existing = await c.env.DB.prepare(`
      SELECT id FROM appointment_reminder_settings 
      WHERE user_id = ? AND appointment_id IS NULL AND patient_id IS NULL
    `).bind(user.id).first();

    let result;
    if (existing) {
      // Update existing settings
      result = await c.env.DB.prepare(`
        UPDATE appointment_reminder_settings SET 
          send_4_days_before = ?, send_3_days_before = ?, send_2_days_before = ?,
          send_1_day_before = ?, send_day_of = ?, send_time_4_days = ?,
          send_time_3_days = ?, send_time_2_days = ?, send_time_1_day = ?,
          send_time_day_of = ?, reminder_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        data.send_4_days_before ? 1 : 0,
        data.send_3_days_before ? 1 : 0,
        data.send_2_days_before ? 1 : 0,
        data.send_1_day_before ? 1 : 0,
        data.send_day_of ? 1 : 0,
        data.send_time_4_days,
        data.send_time_3_days,
        data.send_time_2_days,
        data.send_time_1_day,
        data.send_time_day_of,
        data.reminder_message || null,
        existing.id
      ).run();
    } else {
      // Create new settings
      result = await c.env.DB.prepare(`
        INSERT INTO appointment_reminder_settings (
          user_id, send_4_days_before, send_3_days_before, send_2_days_before,
          send_1_day_before, send_day_of, send_time_4_days, send_time_3_days,
          send_time_2_days, send_time_1_day, send_time_day_of, reminder_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        data.send_4_days_before ? 1 : 0,
        data.send_3_days_before ? 1 : 0,
        data.send_2_days_before ? 1 : 0,
        data.send_1_day_before ? 1 : 0,
        data.send_day_of ? 1 : 0,
        data.send_time_4_days,
        data.send_time_3_days,
        data.send_time_2_days,
        data.send_time_1_day,
        data.send_time_day_of,
        data.reminder_message || null
      ).run();
    }

    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Failed to save reminder settings' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Failed to save reminder settings' }, 500);
  }
});

// Get reminder settings for specific patient
reminderSettingsRoutes.get('/patient/:patientId', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const patientId = c.req.param('patientId');
    
    // Verify patient belongs to user
    const patient = await c.env.DB.prepare(
      'SELECT id FROM patients WHERE id = ? AND (user_id = ? OR user_id LIKE "anonymous_user_%")'
    ).bind(patientId, user.id).first();
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    const settings = await c.env.DB.prepare(`
      SELECT * FROM appointment_reminder_settings 
      WHERE patient_id = ? AND appointment_id IS NULL
      ORDER BY created_at DESC LIMIT 1
    `).bind(patientId).first();

    if (!settings) {
      // Return global settings as defaults
      const globalSettings = await c.env.DB.prepare(`
        SELECT * FROM appointment_reminder_settings 
        WHERE user_id = ? AND appointment_id IS NULL AND patient_id IS NULL
        ORDER BY created_at DESC LIMIT 1
      `).bind(user.id).first();

      return c.json(globalSettings || {
        send_4_days_before: true,
        send_3_days_before: true,
        send_2_days_before: true,
        send_1_day_before: true,
        send_day_of: true,
        send_time_4_days: '10:00',
        send_time_3_days: '10:00',
        send_time_2_days: '10:00',
        send_time_1_day: '10:00',
        send_time_day_of: '09:00'
      });
    }

    return c.json(settings);
  } catch (error) {
    return c.json({ error: 'Failed to fetch patient reminder settings' }, 500);
  }
});

// Save reminder settings for specific patient
reminderSettingsRoutes.post('/patient/:patientId', zValidator('json', reminderSettingsSchema), async (c) => {
  try {
    const user = await getUserFromContext(c);
    const patientId = c.req.param('patientId');
    const data = c.req.valid('json');
    
    // Verify patient belongs to user
    const patient = await c.env.DB.prepare(
      'SELECT id FROM patients WHERE id = ? AND (user_id = ? OR user_id LIKE "anonymous_user_%")'
    ).bind(patientId, user.id).first();
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    // Check if patient-specific settings exist
    const existing = await c.env.DB.prepare(`
      SELECT id FROM appointment_reminder_settings 
      WHERE patient_id = ? AND appointment_id IS NULL
    `).bind(patientId).first();

    let result;
    if (existing) {
      // Update existing settings
      result = await c.env.DB.prepare(`
        UPDATE appointment_reminder_settings SET 
          send_4_days_before = ?, send_3_days_before = ?, send_2_days_before = ?,
          send_1_day_before = ?, send_day_of = ?, send_time_4_days = ?,
          send_time_3_days = ?, send_time_2_days = ?, send_time_1_day = ?,
          send_time_day_of = ?, reminder_message = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        data.send_4_days_before ? 1 : 0,
        data.send_3_days_before ? 1 : 0,
        data.send_2_days_before ? 1 : 0,
        data.send_1_day_before ? 1 : 0,
        data.send_day_of ? 1 : 0,
        data.send_time_4_days,
        data.send_time_3_days,
        data.send_time_2_days,
        data.send_time_1_day,
        data.send_time_day_of,
        data.reminder_message || null,
        existing.id
      ).run();
    } else {
      // Create new patient-specific settings
      result = await c.env.DB.prepare(`
        INSERT INTO appointment_reminder_settings (
          user_id, patient_id, send_4_days_before, send_3_days_before, send_2_days_before,
          send_1_day_before, send_day_of, send_time_4_days, send_time_3_days,
          send_time_2_days, send_time_1_day, send_time_day_of, reminder_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        patientId,
        data.send_4_days_before ? 1 : 0,
        data.send_3_days_before ? 1 : 0,
        data.send_2_days_before ? 1 : 0,
        data.send_1_day_before ? 1 : 0,
        data.send_day_of ? 1 : 0,
        data.send_time_4_days,
        data.send_time_3_days,
        data.send_time_2_days,
        data.send_time_1_day,
        data.send_time_day_of,
        data.reminder_message || null
      ).run();
    }

    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Failed to save patient reminder settings' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Failed to save patient reminder settings' }, 500);
  }
});

// Bulk update reminder times for multiple patients
reminderSettingsRoutes.post('/bulk-update', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const data = await c.req.json();
    const { patient_ids, settings } = data;

    if (!settings) {
      return c.json({ error: 'Settings are required' }, 400);
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

        // Check if patient-specific settings exist
        const existing = await c.env.DB.prepare(`
          SELECT id FROM appointment_reminder_settings 
          WHERE patient_id = ? AND appointment_id IS NULL
        `).bind(patientId).first();

        if (existing) {
          await c.env.DB.prepare(`
            UPDATE appointment_reminder_settings SET 
              send_time_4_days = ?, send_time_3_days = ?, send_time_2_days = ?,
              send_time_1_day = ?, send_time_day_of = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            settings.send_time_4_days || '10:00',
            settings.send_time_3_days || '10:00',
            settings.send_time_2_days || '10:00',
            settings.send_time_1_day || '10:00',
            settings.send_time_day_of || '09:00',
            existing.id
          ).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO appointment_reminder_settings (
              user_id, patient_id, send_time_4_days, send_time_3_days,
              send_time_2_days, send_time_1_day, send_time_day_of
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            user.id,
            patientId,
            settings.send_time_4_days || '10:00',
            settings.send_time_3_days || '10:00',
            settings.send_time_2_days || '10:00',
            settings.send_time_1_day || '10:00',
            settings.send_time_day_of || '09:00'
          ).run();
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
          SELECT id FROM appointment_reminder_settings 
          WHERE patient_id = ? AND appointment_id IS NULL
        `).bind(patientId).first();

        if (existing) {
          await c.env.DB.prepare(`
            UPDATE appointment_reminder_settings SET 
              send_time_4_days = ?, send_time_3_days = ?, send_time_2_days = ?,
              send_time_1_day = ?, send_time_day_of = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            settings.send_time_4_days || '10:00',
            settings.send_time_3_days || '10:00',
            settings.send_time_2_days || '10:00',
            settings.send_time_1_day || '10:00',
            settings.send_time_day_of || '09:00',
            existing.id
          ).run();
        } else {
          await c.env.DB.prepare(`
            INSERT INTO appointment_reminder_settings (
              user_id, patient_id, send_time_4_days, send_time_3_days,
              send_time_2_days, send_time_1_day, send_time_day_of
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            user.id,
            patientId,
            settings.send_time_4_days || '10:00',
            settings.send_time_3_days || '10:00',
            settings.send_time_2_days || '10:00',
            settings.send_time_1_day || '10:00',
            settings.send_time_day_of || '09:00'
          ).run();
        }
        updatedCount++;
      }
    }

    return c.json({ success: true, updated_count: updatedCount });
  } catch (error) {
    return c.json({ error: 'Failed to bulk update reminder settings' }, 500);
  }
});

export default reminderSettingsRoutes;
