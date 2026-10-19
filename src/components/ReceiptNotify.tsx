import { useState } from "react";
import { useI18n } from "../lib/i18n";
import { systemNotice } from "../lib/purchase";
import { useStore } from "../lib/store";

/**
 * After a purchase: offer phone notifications for receipts (the browser only allows asking from a tap).
 * Once allowed, the receipt just issued is shown as a notification right away; later receipts notify on their own.
 */
export function ReceiptNotify({ receiptNo }: { receiptNo: string }) {
  const { t, href } = useI18n();
  const { setReminders } = useStore();
  const [asked, setAsked] = useState(false);
  if (asked || !receiptNo || typeof Notification === "undefined" || Notification.permission !== "default") return null;
  const ask = async () => {
    setAsked(true);
    if ((await Notification.requestPermission()) !== "granted") return;
    setReminders(true);
    systemNotice(t.receipt.notice.replace("{no}", receiptNo), t.receipt.noticeSub, href(`receipt/${receiptNo}`));
  };
  return (
    <div className="card stack gap-8">
      <p className="small muted">{t.receipt.notifyOnSub}</p>
      <button type="button" className="btn btn--secondary btn--block" onClick={ask}>
        {t.receipt.notifyOn}
      </button>
    </div>
  );
}
