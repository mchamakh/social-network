import Image from "next/image";

export default function Logo() {
  return (
    <div className="px-4 py-6">
      <Image src="/logo.png" alt="logo" className="h-10 w-auto" />
    </div>
  );
}
