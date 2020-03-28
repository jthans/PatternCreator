using Hans.Math.Geometry.Models;
using Microsoft.AspNetCore.Mvc;
using PatternCreator.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PatternCreator.Controllers
{
    /// <summary>
    ///  Controller managing all pattern-focused functionality for this website.
    /// </summary>
    public class PatternController : Controller
    {
        /// <summary>
        ///  Takes all the polygons existing in a pattern, and creates a composite plan with them.
        /// </summary>
        /// <param name="patternPolys">The polygons in the pattern that we're going to process.</param>
        /// <returns>A composite plan, informing the user what polygons need to be cut to create the pattern.</returns>
        public async Task<PatternComposite> CreatePlanFromPattern(List<Polygon> patternPolys)
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

        private void AddPolygonToRegistration(Polygon poly, int polyCount, Dictionary<Polygon, int> polyDic)
        {
            polyDic.Remove(poly);
            polyDic.Add(poly, polyCount);
        }
    }
}
