using Hans.Math.Geometry.Models;
using Hans.WebTools.Helpers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PatternCreator.Models;
using System;
using System.Collections.Generic;
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

        /// <summary>
        ///  Takes all the polygons existing in a pattern, and creates a composite plan with them.
        /// </summary>
        /// <param name="patternPolys">The polygons in the pattern that we're going to process.</param>
        /// <returns>A composite plan, informing the user what polygons need to be cut to create the pattern.</returns>
        [HttpPost]
        [Route("/CreatePlanFromPattern")]
        public PatternComposite CreatePlanFromPattern([FromBody] List<Polygon> patternPolys)
        {
            PatternComposite finalPlan = new PatternComposite()
            {
                Polygons = new Dictionary<Polygon, int>()
            };

            foreach (var poly in patternPolys)
            {
                bool polygonAdded = false;
                foreach (var registedPoly in finalPlan.Polygons)
                {
                    if (registedPoly.Key.IsCongruentWith(poly))
                    {
                        this.AddPolygonToRegistration(registedPoly.Key, registedPoly.Value + 1, finalPlan.Polygons);

                        polygonAdded = true;
                        break;
                    }
                }

                if (!polygonAdded)
                {
                    this.AddPolygonToRegistration(poly, 1, finalPlan.Polygons);
                }
            }

            return finalPlan;
        }

        /// <summary>
        ///  Adds a polygon to the Dictionary with the given polygon count.
        /// </summary>
        /// <param name="poly">Polygon to track in the Dictionary.</param>
        /// <param name="polyCount">How many times this polygon is present.</param>
        /// <param name="polyDic">All polygons in this pattern.</param>
        private void AddPolygonToRegistration(Polygon poly, int polyCount, Dictionary<Polygon, int> polyDic)
        {
            polyDic.Remove(poly);
            polyDic.Add(poly, polyCount);
        }
    }
}