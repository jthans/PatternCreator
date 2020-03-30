using Hans.Math.Geometry.Models;
using PatternCreator.Controllers;
using System.Collections.Generic;

namespace PatternCreator.Models
{
    /// <summary>
    ///  Composite model describing the polygons that lie within, and any description associated with it.
    /// </summary>
    public class PatternComposite
    {
        /// <summary>
        ///  Name of the pattern that's represented by this model.
        /// </summary>
        public string PatternName { get; set; }

        /// <summary>
        ///  Collection of polygons in this pattern, along with the number of iterations
        ///     that the polygon occurs in the pattern.
        /// </summary>
        public Dictionary<Polygon, int> Polygons { get; set; }
    }
}
