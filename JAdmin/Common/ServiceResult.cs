namespace JAdmin.Common;

public class ServiceResult<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public bool RequiresTwoFactor { get; init; }
    public int? StatusCode { get; init; }

    public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };

    public static ServiceResult<T> Fail(string error, int statusCode = 400, bool requiresTwoFactor = false) =>
        new() { Success = false, Error = error, StatusCode = statusCode, RequiresTwoFactor = requiresTwoFactor };
}

public class ServiceResult
{
    public bool Success { get; init; }
    public string? Error { get; init; }
    public int? StatusCode { get; init; }

    public static ServiceResult Ok() => new() { Success = true };

    public static ServiceResult Fail(string error, int statusCode = 400) =>
        new() { Success = false, Error = error, StatusCode = statusCode };
}
