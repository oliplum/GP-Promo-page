import Image from 'next/image';
export default function Header() {
  return (
    <div className="header">
      <Image src="/cbt-logo.png" alt="CBT Logo" width={200} height={100} />
      <h1>Welcome to the CBTReach Big Winter Sale for 2026! </h1>
    </div>
  );
}