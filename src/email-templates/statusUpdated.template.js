function statusUpdatedTemplate({ receiverName, trackingId, status, timestamp }) {
  const formattedDate = new Date(timestamp).toISOString().split("T")[0];
  const normalizedStatus = String(status || "").toLowerCase();
  const sentenceStatus = normalizedStatus || "updated";
  const sentence =
    sentenceStatus === "delivered"
      ? `Your shipment ${trackingId} has been delivered.`
      : `Your shipment ${trackingId} is now ${sentenceStatus}.`;

  return {
    subject: `Shipment Status Updated - ${trackingId}`,
    text: [
      `Dear ${receiverName},`,
      "",
      "This is an official update regarding your shipment.",
      sentence,
      "",
      `Tracking ID: ${trackingId}`,
      `Updated On: ${formattedDate}`,
      "",
      "For any assistance, please contact DTLC Logistics Support.",
      "",
      "Regards,",
      "DTLC Logistics Support",
    ].join("\n"),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937">
      <p>Dear ${receiverName},</p>
      <p>This is an official update regarding your shipment.</p>
      <p>${sentence.replace(trackingId, `<strong>${trackingId}</strong>`)}</p>
      <p><strong>Tracking ID:</strong> ${trackingId}<br/><strong>Updated On:</strong> ${formattedDate}</p>
      <p>For any assistance, please contact DTLC Logistics Support.</p>
      <p>Regards,<br/>DTLC Logistics Support</p>
    </div>`,
  };
}

module.exports = { statusUpdatedTemplate };
