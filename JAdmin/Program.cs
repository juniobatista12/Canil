using JAdmin.Data;
using JAdmin.Extensions;
using JAdmin.Multitenancy;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAppSwagger();
builder.Services.AddAppServices(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.UseAppSwagger();
app.UseHttpsRedirection();
app.UseCors("AppCors");
app.UseAuthentication();
app.UseMultitenancy();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await initializer.InitializeAsync();
}

app.Run();

public partial class Program;
