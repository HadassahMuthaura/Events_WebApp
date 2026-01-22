import nodemailer from 'nodemailer'

// Create transporter (disabled for development - just logs to console)
const createTransporter = () => {
  // Check if SMTP credentials are configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Using real SMTP transport:', process.env.SMTP_HOST)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  
  // Fallback: Use console logging for development
  console.log('⚠️  No SMTP configured - emails will be logged to console only')
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  })
}

// Send booking confirmation email
export const sendBookingConfirmation = async (booking, user, event) => {
  try {
    console.log(`📧 [Email Service] Sending booking confirmation to ${user.email} for event: ${event.title}`)
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Events App" <${process.env.EMAIL_FROM || 'noreply@eventsapp.com'}>`,
      to: user.email,
      subject: `Booking Confirmation - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.full_name},</p>
              <p>Your booking has been confirmed! We're excited to see you at the event.</p>
              
              <div class="booking-details">
                <h2>Event Details</h2>
                <div class="detail-row">
                  <span class="label">Event:</span>
                  <span>${event.title}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span>${new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span>${event.location}</span>
                </div>
                ${event.venue ? `
                <div class="detail-row">
                  <span class="label">Venue:</span>
                  <span>${event.venue}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="label">Tickets:</span>
                  <span>${booking.tickets_count}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span>$${booking.total_amount}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Booking Reference:</span>
                  <span><strong>${booking.reference_number}</strong></span>
                </div>
              </div>
              
              <p>Please keep this confirmation email for your records. You'll need your booking reference at the event.</p>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/bookings" class="button">View My Bookings</a>
              </center>
              
              <div class="footer">
                <p>If you have any questions, please contact us at support@eventsapp.com</p>
                <p>&copy; 2026 Events App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Booking confirmation email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error)
    // Don't throw error - email failure shouldn't break booking
    return null
  }
}

// Send event reminder email
export const sendEventReminder = async (booking, user, event, hoursUntil) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Events App" <${process.env.EMAIL_FROM || 'noreply@eventsapp.com'}>`,
      to: user.email,
      subject: `Reminder: ${event.title} in ${hoursUntil} hours!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Event Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${user.full_name},</p>
              
              <div class="reminder-box">
                <strong>Don't forget!</strong> Your event is coming up in ${hoursUntil} hours.
              </div>
              
              <div class="event-details">
                <h2>${event.title}</h2>
                <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>🕐 Time:</strong> ${new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
                ${event.venue ? `<p><strong>🏢 Venue:</strong> ${event.venue}</p>` : ''}
                <p><strong>🎫 Your Tickets:</strong> ${booking.tickets_count}</p>
                <p><strong>📝 Booking Reference:</strong> <strong>${booking.reference_number}</strong></p>
              </div>
              
              <p>We're looking forward to seeing you there! Please arrive 15 minutes early.</p>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/events/${event.id}" class="button">View Event Details</a>
              </center>
              
              <div class="footer">
                <p>If you can't make it, please cancel your booking to free up tickets for others.</p>
                <p>&copy; 2026 Events App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Event reminder email sent (${hoursUntil}h):`, info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending event reminder email:', error)
    return null
  }
}

// Send event invitation email
export const sendEventInvitation = async (invitation, inviter, event) => {
  try {
    const transporter = createTransporter()
    
    const acceptUrl = `${process.env.FRONTEND_URL}/invitations/${invitation.id}/accept?token=${invitation.token}`
    const declineUrl = `${process.env.FRONTEND_URL}/invitations/${invitation.id}/decline?token=${invitation.token}`
    
    const mailOptions = {
      from: `"Events App" <${process.env.EMAIL_FROM || 'noreply@eventsapp.com'}>`,
      to: invitation.email,
      subject: `You're Invited: ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .buttons { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold; }
            .accept { background: #4caf50; color: white; }
            .decline { background: #f44336; color: white; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p><strong>${inviter.full_name}</strong> has invited you to join an event:</p>
              
              <div class="event-card">
                <h2>${event.title}</h2>
                <p>${event.description}</p>
                <hr>
                <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>🕐 Time:</strong> ${new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
                ${event.venue ? `<p><strong>🏢 Venue:</strong> ${event.venue}</p>` : ''}
                <p><strong>🎫 Price:</strong> ${event.price > 0 ? `$${event.price}` : 'Free'}</p>
              </div>
              
              <div class="buttons">
                <a href="${acceptUrl}" class="button accept">✓ Accept Invitation</a>
                <a href="${declineUrl}" class="button decline">✗ Decline</a>
              </div>
              
              <p style="text-align: center; color: #666; font-size: 14px;">
                Please respond to let ${inviter.full_name} know if you can attend.
              </p>
              
              <div class="footer">
                <p>This invitation was sent by ${inviter.full_name} (${inviter.email})</p>
                <p>&copy; 2026 Events App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Event invitation email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending invitation email:', error)
    return null
  }
}

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Events App" <${process.env.EMAIL_FROM || 'noreply@eventsapp.com'}>`,
      to: user.email,
      subject: 'Welcome to Events App! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { padding: 15px 0; border-bottom: 1px solid #eee; }
            .feature:last-child { border-bottom: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Events App!</h1>
              <p>Your journey to amazing events starts here</p>
            </div>
            <div class="content">
              <p>Hi ${user.full_name},</p>
              <p>Thank you for joining Events App! We're thrilled to have you as part of our community.</p>
              
              <div class="features">
                <h3>What you can do:</h3>
                <div class="feature">
                  <strong>🔍 Discover Events</strong><br>
                  Browse thousands of events across multiple categories
                </div>
                <div class="feature">
                  <strong>🎫 Book Tickets</strong><br>
                  Secure your spot at events with easy online booking
                </div>
                <div class="feature">
                  <strong>📅 Manage Bookings</strong><br>
                  View all your bookings in one convenient dashboard
                </div>
                <div class="feature">
                  <strong>🔔 Get Reminders</strong><br>
                  Receive timely reminders before your events
                </div>
                <div class="feature">
                  <strong>⭐ Share Reviews</strong><br>
                  Rate and review events after attending
                </div>
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/events" class="button">Explore Events</a>
              </center>
              
              <div class="footer">
                <p>Need help? Contact us at support@eventsapp.com</p>
                <p>&copy; 2026 Events App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return null
  }
}

export default {
  sendBookingConfirmation,
  sendEventReminder,
  sendEventInvitation,
  sendWelcomeEmail,
}
