type AnnouncementBarProps = {
  text: string;
};

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  return (
    <div className="announcement">
      <span>✦</span> {text} <span>✦</span>
    </div>
  );
}
