package com.iit.admin.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:temp.office.iit@gmail.com}")
    private String fromEmail;

    public void sendLeaveStatusEmail(String toEmail, String applicantName, String startDate, String endDate, String status, String remarks) {
        String subject = "Leave Request Decision: " + status;
        
        // Brand Slate/Blue colors mapping based on the premium frontend theme
        String accentColor;
        String badgeBg;
        String badgeText;
        String badgeBorder;

        if ("APPROVED".equalsIgnoreCase(status)) {
            accentColor = "#059669"; // Emerald 600
            badgeBg = "#ecfdf5";     // Emerald 50
            badgeText = "#065f46";   // Emerald 800
            badgeBorder = "#a7f3d0"; // Emerald 200
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            accentColor = "#dc2626"; // Rose 600
            badgeBg = "#fef2f2";     // Rose 50
            badgeText = "#991b1b";   // Rose 800
            badgeBorder = "#fecaca"; // Rose 200
        } else {
            accentColor = "#d97706"; // Amber 600 (Pending/Other)
            badgeBg = "#fffbeb";     // Amber 50
            badgeText = "#92400e";   // Amber 800
            badgeBorder = "#fef3c7"; // Amber 200
        }

        // Admin Remarks section HTML template styled like a premium callout quote
        String remarksHtml = "";
        if (remarks != null && !remarks.trim().isEmpty()) {
            remarksHtml = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 16px;\">\n" +
                          "    <tr>\n" +
                          "        <td style=\"background-color: #f1f5f9; border-left: 4px solid #cbd5e1; padding: 16px; border-radius: 8px;\">\n" +
                          "            <div style=\"font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;\">Admin Remarks</div>\n" +
                          "            <div style=\"font-family: 'Inter', sans-serif; font-size: 14px; font-style: italic; color: #334155; line-height: 1.5;\">\"" + remarks + "\"</div>\n" +
                          "        </td>\n" +
                          "    </tr>\n" +
                          "</table>";
        }

        // HTML Template matching the premium React frontend Slate & Card styling and colors
        String htmlBody = "<!DOCTYPE html>\n" +
            "<html>\n" +
            "<head>\n" +
            "    <meta charset=\"UTF-8\">\n" +
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "    <title>Leave Request Decision</title>\n" +
            "    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap\" rel=\"stylesheet\">\n" +
            "    <style type=\"text/css\">\n" +
            "        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\n" +
            "        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }\n" +
            "        img { -ms-interpolation-mode: bicubic; }\n" +
            "        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }\n" +
            "        table { border-collapse: collapse !important; }\n" +
            "        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #fafaf9; }\n" +
            "        a[x-apple-data-detectors] {\n" +
            "            color: inherit !important;\n" +
            "            text-decoration: none !important;\n" +
            "            font-size: inherit !important;\n" +
            "            font-family: inherit !important;\n" +
            "            font-weight: inherit !important;\n" +
            "            line-height: inherit !important;\n" +
            "        }\n" +
            "        @media screen and (max-width: 600px) {\n" +
            "            .container { width: 100% !important; max-width: 100% !important; }\n" +
            "            .content { padding: 28px 20px !important; }\n" +
            "            .header { padding: 28px 20px !important; }\n" +
            "        }\n" +
            "    </style>\n" +
            "</head>\n" +
            "<body style=\"background-color: #fafaf9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; color: #334155;\">\n" +
            "    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
            "        <tr>\n" +
            "            <td align=\"center\" style=\"background-color: #fafaf9; padding: 40px 10px;\">\n" +
            "                <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"container\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;\">\n" +
            "                    <!-- Header Banner (matching React dashboard welcome banner gradient) -->\n" +
            "                    <tr>\n" +
            "                        <td align=\"left\" class=\"header\" style=\"background: #0B1320; background: linear-gradient(135deg, #0B1320 0%, #3a1010 50%, #5f1a1a 100%); padding: 32px 32px; border-bottom: 3px solid #fbbf24;\">\n" +
            "                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
            "                                <tr>\n" +
            "                                    <td>\n" +
            "                                        <div style=\"font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;\">IIT Administration</div>\n" +
            "                                        <h1 style=\"font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.5px;\">Admin Office Portal</h1>\n" +
            "                                    </td>\n" +
            "                                </tr>\n" +
            "                            </table>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <!-- Body Content -->\n" +
            "                    <tr>\n" +
            "                        <td align=\"left\" class=\"content\" style=\"padding: 40px 32px; background-color: #ffffff;\">\n" +
            "                            <h2 style=\"font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 600; color: #0B1320; margin-top: 0; margin-bottom: 16px;\">Hello {{applicantName}},</h2>\n" +
            "                            <p style=\"font-size: 15px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;\">Your submitted leave request has been processed by the Administrative Office. Below is the official decision regarding your application:</p>\n" +
            "                            \n" +
            "                            <!-- Info Box Card -->\n" +
            "                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #f8fafc; border-radius: 12px; border-left: 4px solid {{accentColor}}; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;\">\n" +
            "                                <tr>\n" +
            "                                    <td style=\"padding: 24px;\">\n" +
            "                                        <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
            "                                            <!-- Period Row -->\n" +
            "                                            <tr>\n" +
            "                                                <td style=\"padding-bottom: 14px; border-bottom: 1px solid #e2e8f0;\">\n" +
            "                                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
            "                                                        <tr>\n" +
            "                                                            <td width=\"100\" valign=\"top\" style=\"font-size: 13px; font-weight: 600; color: #64748b; font-family: 'Inter', sans-serif;\">Leave Period</td>\n" +
            "                                                            <td valign=\"top\" style=\"font-size: 14px; font-weight: 500; color: #0B1320; font-family: 'Inter', sans-serif;\">{{startDate}} to {{endDate}}</td>\n" +
            "                                                        </tr>\n" +
            "                                                    </table>\n" +
            "                                                </td>\n" +
            "                                            </tr>\n" +
            "                                            <!-- Status Row -->\n" +
            "                                            <tr>\n" +
            "                                                <td style=\"padding-top: 14px;\">\n" +
            "                                                    <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
            "                                                        <tr>\n" +
            "                                                            <td width=\"100\" valign=\"middle\" style=\"font-size: 13px; font-weight: 600; color: #64748b; font-family: 'Inter', sans-serif;\">Status</td>\n" +
            "                                                            <td valign=\"middle\">\n" +
            "                                                                <span style=\"display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; font-family: 'Inter', sans-serif; text-transform: uppercase; border-radius: 6px; background-color: {{badgeBg}}; color: {{badgeText}}; border: 1px solid {{badgeBorder}}; letter-spacing: 0.5px;\">\n" +
            "                                                                    {{status}}\n" +
            "                                                                </span>\n" +
            "                                                            </td>\n" +
            "                                                        </tr>\n" +
            "                                                    </table>\n" +
            "                                                </td>\n" +
            "                                            </tr>\n" +
            "                                        </table>\n" +
            "                                    </td>\n" +
            "                                </tr>\n" +
            "                            </table>\n" +
            "                            \n" +
            "                            <!-- Remarks Section (If Any) -->\n" +
            "                            {{remarksHtml}}\n" +
            "                            \n" +
            "                            <!-- Action Button -->\n" +
            "                            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 32px; margin-bottom: 16px;\">\n" +
            "                                <tr>\n" +
            "                                    <td align=\"center\">\n" +
            "                                        <a href=\"http://localhost:5173/leaves\" target=\"blank\" style=\"display: inline-block; background-color: #0B1320; color: #ffffff; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(11, 19, 32, 0.1), 0 2px 4px -1px rgba(11, 19, 32, 0.06);\">\n" +
            "                                            Go to Leave Portal\n" +
            "                                        </a>\n" +
            "                                    </td>\n" +
            "                                </tr>\n" +
            "                            </table>\n" +
            "                            \n" +
            "                            <p style=\"font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 24px; margin-bottom: 0;\">If you have any questions or require changes to your application, please reach out to the Administrative Department or reply directly to this mail.</p>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <!-- Footer -->\n" +
            "                    <tr>\n" +
            "                        <td align=\"center\" style=\"background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; font-size: 12px; color: #94a3b8; line-height: 1.5;\">\n" +
            "                            <p style=\"margin: 0 0 6px 0; font-weight: 500; color: #64748b;\">Indian Institute of Technology, Allahabad</p>\n" +
            "                            <p style=\"margin: 0;\">This is an automated administrative notification. Please do not reply directly to this mail unless instructed.</p>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </table>\n" +
            "            </td>\n" +
            "        </tr>\n" +
            "    </table>\n" +
            "</body>\n" +
            "</html>";

        htmlBody = htmlBody
            .replace("{{applicantName}}", applicantName)
            .replace("{{accentColor}}", accentColor)
            .replace("{{startDate}}", startDate)
            .replace("{{endDate}}", endDate)
            .replace("{{badgeBg}}", badgeBg)
            .replace("{{badgeText}}", badgeText)
            .replace("{{badgeBorder}}", badgeBorder)
            .replace("{{status}}", status)
            .replace("{{remarksHtml}}", remarksHtml);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            System.out.println("[DEVELOPMENT MODE] Email sender is not configured. Details below:");
            System.out.println("TO: " + to);
            System.out.println("FROM: " + fromEmail);
            System.out.println("SUBJECT: " + subject);
            System.out.println("HTML CONTENT:\n" + htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("HTML Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email to " + to + ": " + e.getMessage());
            System.out.println("[FALLBACK LOG] Email details:\nTO: " + to + "\nSUBJECT: " + subject + "\nHTML CONTENT:\n" + htmlContent);
        }
    }
}
