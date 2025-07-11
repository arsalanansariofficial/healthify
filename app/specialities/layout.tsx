type Props = Readonly<{ children: React.ReactNode; modal: React.ReactNode }>;

export default function Layout({ modal, children }: Props) {
  return (
    <>
      {modal}
      {children}
    </>
  );
}
