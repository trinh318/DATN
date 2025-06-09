const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'htttrinh145@gmail.com',     // email bạn dùng để gửi
    pass: 'fidg pfmy ozzr rriu',        // app password từ Google
  },
});

const sendVerificationEmail = (userEmail, verificationLink) => {
  const mailOptions = {
    from: 'htttrinh145@gmail.com',
    to: userEmail,
    subject: 'Xác thực tài khoản',
    html: `<p>Chào bạn,</p>
           <p>Vui lòng xác nhận tài khoản của bạn bằng cách nhấn vào liên kết dưới đây:</p>
           <a href="${verificationLink}">Xác thực tài khoản</a>`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
