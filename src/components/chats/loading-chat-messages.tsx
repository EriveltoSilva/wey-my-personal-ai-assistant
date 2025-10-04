export const LoadingChatMessages = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        {/* <p className="text-muted-foreground">...</p> */}
      </div>
    </div>
  );
};
