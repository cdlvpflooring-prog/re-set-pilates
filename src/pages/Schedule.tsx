import { PageHead, ScheduleBoard } from "../components/blocks";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";

export default function Schedule() {
  const { t } = useI18n();
  useSeo(t.meta.schedule);
  return (
    <div className="page tone-dark has-tabbar">
      <PageHead title={t.schedule.title} sub={t.schedule.sub} app />
      <div className="wrap wrap--app pbody screen">
        <ScheduleBoard />
      </div>
    </div>
  );
}
