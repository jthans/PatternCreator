using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hans.WebTools.Helpers
{
    /// <summary>
    ///  Any helpers that are useful for controller management.  Assists in async management, and more.
    /// </summary>
    public static class ControllerHelpers
    {
        /// <summary>
        ///  Asyncronously calls the method's view so the controller can handle it properly.
        /// </summary>
        /// <param name="thisController">The controller that's being called upon.</param>
        /// <returns>The view pertaining to this method being called.</returns>
        public static async Task<ActionResult> ViewAsync(this Controller thisController)
        {
            return await Task.Run(() => thisController.View());
        }
    }
}
