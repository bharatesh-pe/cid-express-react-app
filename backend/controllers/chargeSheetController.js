const { ChargeSheet } = require("../models");

module.exports = {
    async getChargeSheetData(req, res) {
        try {

            const { case_id, module } = req.body;

            if (!case_id || !module) {
                return res.status(400).json({ message: "Missing case_id or module" });
            }

            const chargeSheet = await ChargeSheet.findOne({
                where: {
                    case_id: case_id,
                    module: module
                }
            });

            if (!chargeSheet) {
                return res.json({ message: "Charge Sheet not found" });
            }

            res.json({ success: true, data: chargeSheet });

        } catch (error) {
            console.error("Error fetching Charge Sheet:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async saveChargeSheetData(req, res) {
        try {
            const { data } = req.body;

            const newChargeSheet = await ChargeSheet.create(data);
            res.json({success: true, data : newChargeSheet});

        } catch (error) {
            console.error("Error saving Charge Sheet:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async updateChargeSheetData(req, res) {
        try {
            const { id, data } = req.body;
            if (!id) return res.status(400).json({ message: "Missing id" });

            const [updated] = await ChargeSheet.update(data, {
                where: { id },
            });

            if (!updated){
                return res.json({success: false, message: "Charge Sheet not found or no changes made",});
            }

            res.json({ success: true, message: "Charge Sheet Updated" });
        } catch (error) {
            console.error("Error updating Charge Sheet:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};
