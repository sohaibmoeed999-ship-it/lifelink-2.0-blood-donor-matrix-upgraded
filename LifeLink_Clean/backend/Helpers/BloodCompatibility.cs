// ============================================================
// HELPER: BloodCompatibility
// Smart rule-based matching engine (no AI/ML — pure logic)
// OOP: Encapsulation — matching logic is hidden behind clean methods
// ============================================================
namespace LifeLink.API.Helpers
{
    public static class BloodCompatibility
    {
        // Maps each blood type to the donor types it can receive from
        // Key = patient's blood type, Value = compatible donor blood types
        private static readonly Dictionary<string, List<string>> CompatibilityMap = new()
        {
            { "A+",  new List<string> { "A+", "A-", "O+", "O-" } },
            { "A-",  new List<string> { "A-", "O-" } },
            { "B+",  new List<string> { "B+", "B-", "O+", "O-" } },
            { "B-",  new List<string> { "B-", "O-" } },
            { "AB+", new List<string> { "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-" } },
            { "AB-", new List<string> { "A-", "B-", "AB-", "O-" } },
            { "O+",  new List<string> { "O+", "O-" } },
            { "O-",  new List<string> { "O-" } },
        };

        /// <summary>
        /// Returns list of blood groups that can donate to the given group.
        /// Example: GetCompatibleDonors("A+") => ["A+", "A-", "O+", "O-"]
        /// </summary>
        public static List<string> GetCompatibleDonors(string requiredGroup)
        {
            return CompatibilityMap.TryGetValue(requiredGroup.Trim(), out var result)
                ? result
                : new List<string>();
        }

        /// <summary>
        /// Scoring algorithm: calculates a priority score for a donor.
        /// Higher score = better match for the patient.
        /// 
        /// Scoring breakdown:
        ///   - Exact blood type match: +50 points
        ///   - O- universal donor:     +30 points
        ///   - Same city:              +20 points
        /// </summary>
        public static int CalculateScore(string donorBlood, string requiredBlood,
                                          string donorCity, string requestCity)
        {
            int score = 0;

            // Exact blood type match gets highest priority
            if (donorBlood.Trim() == requiredBlood.Trim())
                score += 50;

            // O- is the universal donor — always gets a bonus
            if (donorBlood.Trim() == "O-")
                score += 30;

            // Same city = logistically easier to arrange
            if (!string.IsNullOrEmpty(requestCity) &&
                donorCity.Trim().Equals(requestCity.Trim(), StringComparison.OrdinalIgnoreCase))
                score += 20;

            return score;
        }

        /// <summary>
        /// Validates that a blood group string is one of the 8 valid types.
        /// </summary>
        public static bool IsValidBloodGroup(string bloodGroup)
        {
            return CompatibilityMap.ContainsKey(bloodGroup.Trim());
        }
    }
}
