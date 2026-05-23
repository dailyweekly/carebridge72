type CaptureCaptionProps = {
  title: string;
  description: string;
};

export function CaptureCaption({ title, description }: CaptureCaptionProps) {
  return (
    <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span className="font-bold text-teal">{title}</span>
      <span className="ml-2 text-slate-700">{description}</span>
    </div>
  );
}
