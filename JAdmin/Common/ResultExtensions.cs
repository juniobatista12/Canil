using Microsoft.AspNetCore.Mvc;

namespace JAdmin.Common;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this ServiceResult<T> result, ControllerBase controller)
    {
        if (result.Success)
            return controller.Ok(result.Data);

        var status = result.StatusCode ?? StatusCodes.Status400BadRequest;

        if (status == StatusCodes.Status401Unauthorized && result.RequiresTwoFactor)
        {
            return controller.Problem(
                detail: result.Error,
                statusCode: status,
                extensions: new Dictionary<string, object?> { ["requiresTwoFactor"] = true });
        }

        return controller.Problem(detail: result.Error, statusCode: status);
    }

    public static IActionResult ToActionResult(this ServiceResult result, ControllerBase controller)
    {
        if (result.Success)
            return controller.NoContent();

        return controller.Problem(detail: result.Error, statusCode: result.StatusCode ?? StatusCodes.Status400BadRequest);
    }
}
