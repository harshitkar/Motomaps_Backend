import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 587,
	secure: true,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.APP_PASS,
	},
})

async function sendMail(email, OTP) {
	const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: "Verify your MotoMaps account",
		text: `Hi Rider,

Your OTP for verification is ${OTP}.

If you didn't request this, please ignore this email.

Best,
The MotoMaps Team
`,
	}

	await transporter.sendMail(mailOptions)
}

export { sendMail }
