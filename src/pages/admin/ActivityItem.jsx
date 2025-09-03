// src/pages/admin/ActivityItem.jsx
const ActivityItem = ({ action, target, person, date, icon, isLast }) => {
  return (
    <li className="relative pb-8">
      {!isLast && (
        <span
          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center ring-8 ring-white">
            {icon}
          </span>
        </div>
        <div className="min-w-0 flex-1 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-amber-600">{person}</span> {action} a {target}
            </p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={date}>{date}</time>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;