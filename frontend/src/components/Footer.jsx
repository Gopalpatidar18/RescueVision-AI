const Footer = () => {
  return (
    <footer className="border-t border-[#d8dfe4] bg-[#f5f7f8]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 text-xs text-[#687682] sm:flex-row sm:items-center sm:justify-between sm:px-7 xl:px-10">
        <p>RescueVision AI <span className="px-1.5 text-[#aeb9c1]">/</span> Fireground video review</p>
        <p>Analysis history is limited to the current session.</p>
      </div>
    </footer>
  );
};

export default Footer;