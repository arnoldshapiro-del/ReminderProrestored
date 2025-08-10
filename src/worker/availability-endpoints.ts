import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Validation schemas
const createAvailabilityScheduleSchema = z.object({
  user_id: z.string(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  buffer_before_minutes: z.number().default(0),
  buffer_after_minutes: z.number().default(0),
  is_active: z.boolean().default(true)
});

const createTimeOffRequestSchema = z.object({
  user_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  reason: z.string().optional(),
  is_full_day: z.boolean().default(true),
  is_approved: z.boolean().default(true)
});

const app = new Hono<{ Bindings: Env }>();

// Helper function to get user from context
async function getUserFromContext(c: any): Promise<any> {
  const user = c.get('user');
  // Fallback for anonymous users during testing
  if (!user) {
    return { id: 'anonymous_user_' + Date.now() };
  }
  return user;
}

// Availability Schedule endpoints
app.get('/schedules', async (c) => {
  try {
    const user = await getUserFromContext(c);

    const schedules = await c.env.DB.prepare(
      'SELECT * FROM availability_schedules WHERE user_id = ? OR user_id LIKE ? ORDER BY day_of_week, start_time'
    ).bind(user.id, 'anonymous_user_%').all();

    // If no schedules exist, create some default ones for demonstration
    if (!schedules.results || schedules.results.length === 0) {
      // Create default business hours (Monday-Friday 9 AM to 5 PM)
      const defaultSchedules = [];
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        const result = await c.env.DB.prepare(`
          INSERT INTO availability_schedules (
            user_id, day_of_week, start_time, end_time, 
            buffer_before_minutes, buffer_after_minutes, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          user.id,
          day,
          '09:00',
          '17:45',
          15,
          15,
          true
        ).run();

        if (result.success) {
          defaultSchedules.push({
            id: result.meta.last_row_id,
            user_id: user.id,
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            buffer_before_minutes: 15,
            buffer_after_minutes: 15,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      return c.json(defaultSchedules);
    }

    return c.json(schedules.results || []);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/schedules', zValidator('json', createAvailabilityScheduleSchema), async (c) => {
  try {
    const user = await getUserFromContext(c);
    const data = c.req.valid('json');

    const result = await c.env.DB.prepare(`
      INSERT INTO availability_schedules (
        user_id, day_of_week, start_time, end_time, 
        buffer_before_minutes, buffer_after_minutes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.day_of_week,
      data.start_time,
      data.end_time,
      data.buffer_before_minutes,
      data.buffer_after_minutes,
      data.is_active
    ).run();

    if (result.success) {
      return c.json({ success: true, id: result.meta.last_row_id });
    } else {
      return c.json({ error: 'Failed to create schedule' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/schedules/:id', zValidator('json', createAvailabilityScheduleSchema), async (c) => {
  try {
    const user = await getUserFromContext(c);
    const scheduleId = c.req.param('id');
    const data = c.req.valid('json');

    const result = await c.env.DB.prepare(`
      UPDATE availability_schedules SET 
        day_of_week = ?, start_time = ?, end_time = ?,
        buffer_before_minutes = ?, buffer_after_minutes = ?, 
        is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND (user_id = ? OR user_id LIKE ?)
    `).bind(
      data.day_of_week,
      data.start_time,
      data.end_time,
      data.buffer_before_minutes,
      data.buffer_after_minutes,
      data.is_active,
      scheduleId,
      user.id,
      'anonymous_user_%'
    ).run();

    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Failed to update schedule' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/schedules/:id', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const scheduleId = c.req.param('id');

    const result = await c.env.DB.prepare(
      'DELETE FROM availability_schedules WHERE id = ? AND (user_id = ? OR user_id LIKE ?)'
    ).bind(scheduleId, user.id, 'anonymous_user_%').run();

    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Failed to delete schedule' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Time Off Request endpoints
app.get('/time-off', async (c) => {
  try {
    const user = await getUserFromContext(c);

    const timeOffRequests = await c.env.DB.prepare(
      'SELECT * FROM time_off_requests WHERE user_id = ? OR user_id LIKE ? ORDER BY start_date'
    ).bind(user.id, 'anonymous_user_%').all();

    return c.json(timeOffRequests.results || []);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/time-off', zValidator('json', createTimeOffRequestSchema), async (c) => {
  try {
    const user = await getUserFromContext(c);
    const data = c.req.valid('json');

    const result = await c.env.DB.prepare(`
      INSERT INTO time_off_requests (
        user_id, start_date, end_date, start_time, end_time, 
        reason, is_full_day, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.start_date,
      data.end_date,
      data.start_time || null,
      data.end_time || null,
      data.reason || null,
      data.is_full_day,
      data.is_approved
    ).run();

    if (result.success) {
      return c.json({ success: true, id: result.meta.last_row_id });
    } else {
      return c.json({ error: 'Failed to create time off request' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/time-off/:id', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const timeOffId = c.req.param('id');

    const result = await c.env.DB.prepare(
      'DELETE FROM time_off_requests WHERE id = ? AND (user_id = ? OR user_id LIKE ?)'
    ).bind(timeOffId, user.id, 'anonymous_user_%').run();

    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Failed to delete time off request' }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Available slots endpoint for scheduling
app.get('/slots', async (c) => {
  try {
    const user = await getUserFromContext(c);
    const date = c.req.query('date');
    const duration = parseInt(c.req.query('duration') || '60');

    if (!date) {
      return c.json({ error: 'Date parameter is required' }, 400);
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get availability for this day
    const schedules = await c.env.DB.prepare(
      'SELECT * FROM availability_schedules WHERE (user_id = ? OR user_id LIKE ?) AND day_of_week = ? AND is_active = 1'
    ).bind(user.id, 'anonymous_user_%', dayOfWeek).all();

    if (!schedules.results || schedules.results.length === 0) {
      return c.json([]);
    }

    // Get existing appointments for this date
    const appointments = await c.env.DB.prepare(`
      SELECT appointment_date, duration_minutes FROM appointments 
      WHERE (user_id = ? OR user_id LIKE ?) AND DATE(appointment_date) = ? AND status != 'cancelled'
    `).bind(user.id, 'anonymous_user_%', date).all();

    // Get time off requests for this date
    const timeOff = await c.env.DB.prepare(`
      SELECT * FROM time_off_requests 
      WHERE (user_id = ? OR user_id LIKE ?) AND ? BETWEEN start_date AND end_date AND is_approved = 1
    `).bind(user.id, 'anonymous_user_%', date).all();

    // If there's time off for this date, return no slots
    if (timeOff.results && timeOff.results.length > 0) {
      return c.json([]);
    }

    const slots = [];
    for (const schedule of schedules.results as any[]) {
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      

      // Generate time slots
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const slotTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(`${date}T${slotTime}`);
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = appointments.results?.some((apt: any) => {
          const aptTime = new Date(apt.appointment_date);
          const aptEndTime = new Date(aptTime.getTime() + (apt.duration_minutes * 60000));
          const slotEndTime = new Date(slotDateTime.getTime() + (duration * 60000));
          
          return (slotDateTime < aptEndTime && slotEndTime > aptTime);
        });

        if (!hasConflict && slotDateTime > new Date()) {
          slots.push({
            date: date,
            time: slotTime,
            duration: duration
          });
        }

        // Move to next slot (30 minute intervals)
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour += 1;
        }
      }
    }

    return c.json(slots);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
