const mockSendMail = jest.fn().mockResolvedValue({ messageId: '12345' });

// Mock nodemailer before importing the service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

// Set env variables required for the module initialisation
process.env.MAIL_HOST = 'smtp.example.com';
process.env.MAIL_PORT = '587';
process.env.MAIL_USER = 'user';
process.env.MAIL_PASS = 'pass';
process.env.MAIL_FROM = 'no-reply@example.com';
process.env.COMPANY_NAME = 'Doces Mimos';

const { sendPasswordResetEmail } = require('../../src/services/emailService');

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail', () => {
    it('should call sendMail with the correct email, name and resetUrl', async () => {
      const emailParams = {
        to: 'test@example.com',
        name: 'John Doe',
        resetUrl: 'http://localhost:5500/reset?token=abc',
      };

      await sendPasswordResetEmail(emailParams);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'no-reply@example.com',
        to: emailParams.to,
        subject: 'Recuperação de senha - Doces Mimos',
        html: expect.stringContaining('Olá, John Doe!'),
      });
      expect(mockSendMail.mock.calls[0][0].html).toContain(emailParams.resetUrl);
    });
  });
});
