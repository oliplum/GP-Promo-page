import Image from 'next/image';
export default function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <Image src="/cbt-logo.png" alt="CBT Logo" width={200} height={100} />
        <h1>Bringing you expert CBT training </h1>
      </div>
      <div className="header-right">
        <Image src="/DSC_7473.jpg" alt="DSC 7473" fill style={{ objectFit: 'cover' }} />
        <div className="header-overlay-text">
          <h3>Welcome to the CBTReach Big New Year Sale 2026!</h3>
        </div>
      </div>
    </div>
  );
}