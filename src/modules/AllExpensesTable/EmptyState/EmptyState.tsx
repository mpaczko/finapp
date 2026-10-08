type EmptyStateProps = {
  message: string;
};

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="mx-auto max-w-[1360px] overflow-x-auto bg-surface p-8">
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-center text-lg font-medium text-foreground-soft">
          {message}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
