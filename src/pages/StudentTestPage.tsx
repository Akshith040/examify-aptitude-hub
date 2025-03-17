
import StudentTest from "@/components/StudentTest";
import { useSearchParams } from "react-router-dom";

const StudentTestPage = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  
  return <StudentTest scheduledTestId={testId} />;
};

export default StudentTestPage;
