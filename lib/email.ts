/**
 * Email utility for sending notifications
 * For development: logs to console
 * For production: Configure with Resend, SendGrid, or SMTP
 * 
 * To enable email in production:
 * 1. Sign up for Resend (https://resend.com) - free tier available
 * 2. Add RESEND_API_KEY to your environment variables
 * 3. Uncomment the Resend implementation below
 */

export interface InvitationEmailData {
  email: string
  role: string
  teamName?: string
  invitationLink: string
  inviterName?: string
}

export interface GameReminderEmailData {
  email: string
  playerName: string
  opponent: string
  date: Date
  time?: string
  venue: string
  teamName: string
}

export interface TrainingReminderEmailData {
  email: string
  playerName: string
  date: Date
  time: string
  location: string
  teamName: string
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  
  // For development: log to console
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    console.log("=".repeat(60))
    console.log("INVITATION EMAIL (Development Mode)")
    console.log("=".repeat(60))
    console.log(`To: ${data.email}`)
    console.log(`Subject: You've been invited to join ${data.teamName || "the team"}`)
    console.log("\nEmail Body:")
    console.log("-".repeat(60))
    console.log(`
Hello,

You have been invited to join ${data.teamName || "our team"} as a ${data.role}.

${data.inviterName ? `Invited by: ${data.inviterName}` : ""}

Click the link below to accept the invitation and set up your account:

${data.invitationLink}

This link will expire in 48 hours.

If you did not expect this invitation, you can safely ignore this email.

Best regards,
Football CMS Team
    `)
    console.log("-".repeat(60))
    console.log("=".repeat(60))
    return
  }

  // For production: Use Resend API
  // Uncomment when RESEND_API_KEY is configured
  /*
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Football CMS <noreply@yourdomain.com>",
      to: data.email,
      subject: `You've been invited to join ${data.teamName || "the team"}`,
      html: `
        <h2>You've been invited!</h2>
        <p>You have been invited to join ${data.teamName || "our team"} as a ${data.role}.</p>
        ${data.inviterName ? `<p>Invited by: ${data.inviterName}</p>` : ""}
        <p><a href="${data.invitationLink}">Click here to accept the invitation</a></p>
        <p>This link will expire in 48 hours.</p>
      `,
    }),
  })
  */
}

export async function sendGameReminderEmail(data: GameReminderEmailData): Promise<void> {
  const dateStr = data.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  
  // For development: log to console
  if (process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY) {
    console.log("=".repeat(60))
    console.log("GAME REMINDER EMAIL (Development Mode)")
    console.log("=".repeat(60))
    console.log(`To: ${data.email}`)
    console.log(`Subject: Game Reminder: ${data.teamName} vs ${data.opponent}`)
    console.log("\nEmail Body:")
    console.log("-".repeat(60))
    console.log(`
Hi ${data.playerName},

This is a reminder about your upcoming game:

${data.teamName} vs ${data.opponent}
Date: ${dateStr}
${data.time ? `Time: ${data.time}` : ""}
Venue: ${data.venue}

Good luck!

- Football CMS
    `)
    console.log("-".repeat(60))
    return
  }
}

export async function sendTrainingReminderEmail(data: TrainingReminderEmailData): Promise<void> {
  const dateStr = data.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  
  // For development: log to console
  if (process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY) {
    console.log("=".repeat(60))
    console.log("TRAINING REMINDER EMAIL (Development Mode)")
    console.log("=".repeat(60))
    console.log(`To: ${data.email}`)
    console.log(`Subject: Training Reminder: ${data.teamName}`)
    console.log("\nEmail Body:")
    console.log("-".repeat(60))
    console.log(`
Hi ${data.playerName},

This is a reminder about your upcoming training session:

Team: ${data.teamName}
Date: ${dateStr}
Time: ${data.time}
Location: ${data.location}

See you there!

- Football CMS
    `)
    console.log("-".repeat(60))
    return
  }
}

