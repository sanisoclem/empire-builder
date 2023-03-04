type Props = {
  children: React.ReactNode;
};

export default function FormError({ children }: Props) {
  return <div className="text-sm text-red-500">{children}</div>;
}
