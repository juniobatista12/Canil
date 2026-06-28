namespace JAdmin.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseAppSwagger(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            return app;

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "JAdmin API v1");
            options.RoutePrefix = "swagger";
        });

        return app;
    }
}
