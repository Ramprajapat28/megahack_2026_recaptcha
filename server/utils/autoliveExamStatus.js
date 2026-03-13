const cron = require("node-cron");
const { dbWrite } = require("../config/db");

const autoUpdate = cron.schedule("* * * * *", async () => {
  try {

    // scheduled → live
    const liveUpdate = await dbWrite("exams")
      .where("status", "scheduled")
      .andWhere("start_time", "<=", dbWrite.fn.now())
      .update({ status: "live" });

    
    

    if (liveUpdate ) {
      console.log(
        `Cron Update: ${liveUpdate} exams → live`
      );
    }

  } catch (error) {
    console.error("Cron job error:", error);
  }
});

module.exports = autoUpdate;
