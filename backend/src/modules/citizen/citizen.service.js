import AppError from "../../common/utils/appError.js";
import { getCitizen } from "./fayda.client.js";

export const getCitizenProfileByFaydaIdService = async ({ faydaId }) => {
  if (!faydaId) {
    throw new AppError("Fayda ID is required", 400);
  }

  const citizen = await getCitizen(faydaId);

  if (!citizen.success) {
    throw new AppError(citizen.message || "Citizen not found", 404);
  }

  return citizen;
};
