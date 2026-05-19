const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-20 h-20 border-[6px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
};

export default Loading;
