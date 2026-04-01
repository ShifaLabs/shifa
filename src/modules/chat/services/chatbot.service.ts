import { findDoctorsBySpecialization } from "@/modules/navigation/doctor/services/doctor.repository";
import { analyzeSymptoms } from "./symptomAnalyzer.service";

export async function handleChat(message: string) {
  const aiResult = await analyzeSymptoms(message);

  const specialization = aiResult.specialization;
  if (!specialization) {
    return {
      success: true,
      specialization: null,
      doctors: [],
      urgency: aiResult.urgency,
      reason: aiResult.reason,
      message:
        "I could not confidently map these symptoms to a supported specialist. Please provide more details.",
    };
  }

  const doctors = await findDoctorsBySpecialization(specialization);

  return {
    success: true,
    specialization,
    doctors,
    urgency: aiResult.urgency,
    reason: aiResult.reason,
    count: doctors.length,
    message:
      doctors.length > 0
        ? `Based on your symptoms, ${specialization} is the best match.`
        : `No ${specialization} doctors are currently available. Please try again later.`,
  };
}
