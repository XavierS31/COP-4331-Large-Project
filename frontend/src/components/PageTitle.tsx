import knightLabLogo from '../assets/KnightLabLogo.png';

function PageTitle() {
  return (
    <h1 id="title" className="inline-flex items-center gap-2 flex-wrap">
      <img
        src={knightLabLogo}
        alt=""
        className="h-10 w-auto max-w-full object-contain object-left"
      />
      <span className="text-2xl font-black tracking-tight font-headline">
        <span className="text-[#1a1c1b] dark:text-[#f9f9f7]">Knight</span>
        <span className="text-[#755b00] dark:text-[#ffc909]"> Lab</span>
      </span>
    </h1>
  );
}

export default PageTitle;

