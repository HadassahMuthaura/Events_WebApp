import { validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';

export const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, upcoming } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select('*, users(full_name, email)', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (upcoming === 'true') {
      query = query.gte('date', new Date().toISOString());
    }

    const { data: events, error, count } = await query
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      events,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select('*, users(full_name, email)')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer_id: req.user.id
    };

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Check if event exists and user is the organizer
    const { data: existingEvent } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const { data: event, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and user is the organizer
    const { data: existingEvent } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const { data: events, error } = await supabase
      .from('events')
      .select('*, users(full_name, email)')
      .eq('category', category)
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({ events });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*, users(full_name, email)')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({ events });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
};
