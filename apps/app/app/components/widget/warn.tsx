import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type Props = {
  title: string;
  children: React.ReactNode;
};
export default function Warn({ title, children }: Props) {
  return (
    <div
      className="rounded-b border-t-4 border-amber-500 bg-amber-100 px-4 py-3 text-amber-900 shadow-md"
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          <QuestionMarkCircleIcon className="mr-4 h-6 w-6 text-amber-500" />
        </div>
        <div className="space-y-2">
          <p className="font-bold">{title}</p>
          <div className="space-y-2 text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
