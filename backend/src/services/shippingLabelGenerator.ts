import PDFDocument from "pdfkit";
import { Order } from "../types";
import path from "path";
import fs from "fs";

/**
 * Generate a compact shipping label PDF sized to fit 4 labels on an A4 sheet
 * (2 columns × 2 rows). Each label is ~A6 size (half-A4 width × half-A4 height).
 * Black & white only for cost-effective printing.
 *
 * A4 = 595 × 842 pts → each label = 297.5 × 421 pts
 */
export async function generateShippingLabelPDF(
    order: Order,
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        // A6-ish size: half of A4 in each dimension → 4 per A4 sheet
        const labelW = 297.5;
        const labelH = 421;
        const margin = 12;

        const doc = new PDFDocument({
            size: [labelW, labelH],
            margin,
        });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const black = "#000000";
        const gray = "#555555";
        const lightGray = "#999999";
        const contentW = labelW - margin * 2;
        const x = margin;

        // ===== HEADER =====
        let y = margin;
        doc.rect(0, 0, labelW, 40).fill(black);

        // Try to add logo (will be printed B&W)
        const logoPath = path.join(
            __dirname,
            "../../../awla-landing/assets/logo.png",
        );
        if (fs.existsSync(logoPath)) {
            try {
                doc.image(logoPath, 8, 6, { width: 28 });
            } catch (e) {
                // Continue without logo
            }
        }

        doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold");
        doc.text("The Awla Foods Pvt Ltd", 40, 8);
        doc.fontSize(5).fillColor("#cccccc").font("Helvetica");
        doc.text("GSTIN: 08AAMCT9879P1ZV", 40, 20);
        doc.text("SHIPPING LABEL", 40, 28);

        // ===== FROM SECTION =====
        y = 48;
        doc.rect(x, y, contentW, 12).fill("#eeeeee");
        doc.fontSize(6).fillColor(black).font("Helvetica-Bold");
        doc.text("FROM", x + 4, y + 2.5);

        y += 16;
        doc.fontSize(7).fillColor(black).font("Helvetica-Bold");
        doc.text("The Awla Foods Pvt Ltd", x + 4, y, { width: contentW - 8 });
        y += 10;
        doc.fontSize(6).fillColor(gray).font("Helvetica");
        doc.text("GSTIN: 08AAMCT9879P1ZV", x + 4, y, { width: contentW - 8 });
        y += 8;
        doc.text("Jaipur, Rajasthan - 302001", x + 4, y, { width: contentW - 8 });
        y += 8;
        doc.text("Ph: +91 96641 61773 | +91 95539 04820", x + 4, y, { width: contentW - 8 });

        // ===== DIVIDER =====
        y += 14;
        doc
            .moveTo(x, y)
            .lineTo(x + contentW, y)
            .lineWidth(1)
            .dash(3, { space: 2 })
            .stroke(black);
        doc.undash();

        // ===== TO SECTION =====
        y += 6;
        doc.rect(x, y, contentW, 12).fill(black);
        doc.fontSize(6).fillColor("#ffffff").font("Helvetica-Bold");
        doc.text("TO (SHIP TO)", x + 4, y + 2.5);

        y += 18;
        doc.fontSize(9).fillColor(black).font("Helvetica-Bold");
        doc.text(String(order.customerName || ""), x + 4, y, {
            width: contentW - 8,
        });

        y += 13;
        doc.fontSize(7).fillColor(black).font("Helvetica");
        const addr1 = String(order.addressLine1 || "");
        doc.text(addr1, x + 4, y, { width: contentW - 8 });
        y += addr1.length > 40 ? 18 : 10;

        if (order.addressLine2) {
            doc.text(String(order.addressLine2), x + 4, y, { width: contentW - 8 });
            y += 10;
        }

        // City, State
        doc.font("Helvetica-Bold");
        doc.text(`${order.city || ""}, ${order.state || ""}`, x + 4, y, {
            width: contentW - 8,
        });
        y += 10;

        // Pincode — large & prominent
        doc.fontSize(14).fillColor(black).font("Helvetica-Bold");
        doc.text(order.pincode || "", x + 4, y, { width: contentW - 8 });
        y += 18;

        // Phone
        doc.fontSize(7).fillColor(gray).font("Helvetica");
        doc.text(`Ph: ${String(order.customerPhone || "")}`, x + 4, y, {
            width: contentW - 8,
        });

        // ===== ORDER INFO =====
        y += 16;
        doc
            .moveTo(x, y)
            .lineTo(x + contentW, y)
            .lineWidth(0.5)
            .stroke("#cccccc");

        y += 6;
        doc.rect(x, y, contentW, 12).fill("#eeeeee");
        doc.fontSize(6).fillColor(black).font("Helvetica-Bold");
        doc.text("ORDER DETAILS", x + 4, y + 2.5);

        y += 16;
        doc.fontSize(6).fillColor(lightGray).font("Helvetica");
        doc.text("Order #", x + 4, y);
        doc.text("Date", x + 130, y);

        y += 9;
        doc.fontSize(7).fillColor(black).font("Helvetica-Bold");
        doc.text(order.orderNumber, x + 4, y, { width: 124 });
        doc.font("Helvetica").text(
            new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            x + 130,
            y,
            { width: 130 },
        );

        // ===== PRODUCTS =====
        y += 14;
        doc.fontSize(6).fillColor(lightGray).font("Helvetica");
        doc.text("Contents:", x + 4, y);
        y += 9;

        const products = Array.isArray(order.products) ? order.products : [];
        doc.fontSize(6).fillColor(black).font("Helvetica");
        products.forEach((product: any) => {
            const name = product.name || product.productName || "Product";
            const variant = product.variant || "";
            const qty = product.quantity || 1;
            const line = `• ${name}${variant ? " (" + variant + ")" : ""} x${qty}`;
            if (y < 380) {
                doc.text(line, x + 6, y, { width: contentW - 14 });
                y += 9;
            }
        });

        // ===== TOTAL & PAYMENT =====
        y += 4;
        doc
            .moveTo(x, y)
            .lineTo(x + contentW, y)
            .lineWidth(0.5)
            .stroke("#cccccc");

        y += 6;
        const paymentLabel =
            order.paymentStatus === "VERIFIED" ? "PREPAID" : "COD";
        doc.fontSize(7).fillColor(black).font("Helvetica-Bold");
        doc.text(`Total: Rs. ${(order.totalAmount || 0).toFixed(0)}`, x + 4, y);
        doc.fontSize(7).font("Helvetica");
        doc.text(`Payment: ${paymentLabel}`, x + 140, y, {
            width: contentW - 144,
        });
        y += 10;
        doc.fontSize(5).fillColor(gray).font("Helvetica");
        doc.text("* Inclusive of all taxes (GST)", x + 4, y, { width: contentW - 8 });

        // ===== FOOTER =====
        const footerY = labelH - 20;
        doc.fontSize(5).fillColor(lightGray).font("Helvetica");
        doc.text("The Awla Foods Pvt Ltd | GSTIN: 08AAMCT9879P1ZV", x, footerY, {
            width: contentW,
            align: "center",
        });
        doc.text("Ph: +91 96641 61773 | +91 95539 04820 | theawlacompany.com", x, footerY + 7, {
            width: contentW,
            align: "center",
        });

        doc.end();
    });
}

export default { generateShippingLabelPDF };
