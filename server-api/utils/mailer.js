const config = require("../config/config");

const mailjet = require("node-mailjet").connect(config.MJ_APIKEY_PUBLIC, config.MJ_APIKEY_SECRET);

exports.sendConfirmationEmail = async (recipientName, recipientEmail, confirmationCode) => {
	try {
		const request = await mailjet.post("send", {version: "v3.1"}).request({
			Messages: [
				{
					From: {
						Email: config.APP_EMAIL,
						Name: config.APP_NAME,
					},
					To: [
						{
							Email: recipientEmail,
							Name: recipientName,
						},
					],
					TemplateID: 2279018,
					TemplateLanguage: true,
					Subject: "Email Confirmation",
					Variables: {
						name: recipientName,
						confirmation_code: confirmationCode,
					},
				},
			],
		});
	} catch (err) {
		console.log(err);
	}
};

exports.sendResetPassword = async (recipientName, recipientEmail, passwordResetLink) => {
	try {
		const request = await mailjet.post("send", {version: "v3.1"}).request({
			Messages: [
				{
					From: {
						Email: "wlg.noreply@protonmail.com",
						Name: "We ❤️ Games",
					},
					To: [
						{
							Email: recipientEmail,
							Name: recipientName,
						},
					],
					TemplateID: 2281188,
					TemplateLanguage: true,
					Subject: "Password Reset",
					Variables: {
						name: recipientName,
						password_reset_link: passwordResetLink,
					},
				},
			],
		});
	} catch (err) {
		console.log(err);
	}
};
