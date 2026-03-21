import { findDoctorsBySpecialization } from "../doctor/doctor.repository";
import { analyzeSymptoms } from "./symptomAnalyzer.service";
import { initializeIndexes } from "@/lib/dbIndexes";

export async function handleChat(message: string) {
  try {
    await initializeIndexes();
  } catch (indexError) {
    // Index creation failures should not block chatbot responses.
    console.warn("Chatbot index initialization failed:", indexError);
  }

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
