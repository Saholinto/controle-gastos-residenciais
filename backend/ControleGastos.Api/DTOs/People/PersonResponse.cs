namespace ControleGastos.Api.DTOs.People;

/// <summary>
/// Representa os dados de uma pessoa devolvidos pela API.
/// </summary>
public record PersonResponse(
    int Id,
    string Name,
    int Age);