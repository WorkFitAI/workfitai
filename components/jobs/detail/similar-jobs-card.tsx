const SimilarJobsCard = () => {
  const jobs = [
    "Frontend Developer",
    "Backend Engineer",
    "React Developer",
    "Full Stack Developer",
  ];

  return (
    <div className="border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Similar Jobs</h3>

      <ul className="space-y-3">
        {jobs.map((job, index) => (
          <li
            key={index}
            className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
          >
            {job}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SimilarJobsCard;
