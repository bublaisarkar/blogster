
const DashboardHeader = ({ title, description, actionButton }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14141f]">{title}</h1>
        {description && (
          <p className="text-[#6b6b84] text-sm">{description}</p>
        )}
      </div>
      {actionButton && (
        <div className="flex items-center gap-3">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;