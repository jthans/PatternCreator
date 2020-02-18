using Hans.WebTools.Helpers;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PatternCreator.Controllers
{
    public class HomeController : Controller
    {
        /// <summary>
        ///  Default Home Page.
        /// </summary>
        public async Task<ActionResult> Index()
        {
            return await this.ViewAsync();
        }
    }
}
