export default function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid mask-radial opacity-70" />
      <div className="aurora-1 absolute top-[-15%] left-[5%] w-[480px] h-[480px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="aurora-2 absolute top-[-10%] right-[0%] w-[420px] h-[420px] rounded-full bg-fuchsia-600/15 blur-[130px]" />
      <div className="aurora-3 absolute bottom-[-20%] left-[30%] w-[520px] h-[520px] rounded-full bg-violet-600/15 blur-[140px]" />
    </div>
  );
}
