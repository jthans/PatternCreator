using Hans.DependencyInjection;
using Hans.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace PatternCreator
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                // Allow File Browsing/File Viewing in Development.
                // app.UseDirectoryBrowser();
                app.UseStaticFiles();
            }

            // Configure Routing
            app.UseMvc(routes =>
            {
                routes.MapRoute("default", 
                                "{controller}/{action}",
                                new { controller = "Home", action = "Index" });
            });

            MEFBootstrapper.Build();
            LoggerManager.StartLogging();
        }
    }
}
