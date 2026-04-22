function shipmentCreatedTemplate({ receiverName, trackingId, status, timestamp }) {
  const formattedTime = new Date(timestamp).toISOString();
  return {
    subject: `Shipment Booked - ${trackingId}`,
    text: [
      `Dear ${receiverName},`,
      "",
      "Thank you for choosing DTLC Logistics.",
      `Your shipment has been booked successfully and is now registered under tracking ID ${trackingId}.`,
      "",
      `Current Status: ${status}`,
      `Booked At: ${formattedTime}`,
      "",
      "Please keep this tracking ID for future shipment inquiries.",
      "",
      "Regards,",
      "DTLC Logistics Support",
    ].join("\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
      <p>Dear ${receiverName},</p>
      <p>Thank you for choosing <strong>DTLC Logistics</strong>.</p>
      <p>Your shipment has been booked successfully and is now registered under tracking ID <strong>${trackingId}</strong>.</p>
      <p><strong>Current Status:</strong> ${status}<br/><strong>Booked At:</strong> ${formattedTime}</p>
      <p>Please keep this tracking ID for future shipment inquiries.</p>
      <p>Regards,<br/>DTLC Logistics Support</p>
    </div>`,
  };
}

module.exports = { shipmentCreatedTemplate };
