namespace ControleGastos.Api.DTOs.Totals;

/// <summary>
/// Representa a consulta de totais por pessoa e o total geral da residência.
/// </summary>
public class TotalsResponse
{
    public List<PersonTotalsResponse> People { get; set; } = [];

    public decimal TotalIncome { get; set; }

    public decimal TotalExpense { get; set; }

    public decimal NetBalance { get; set; }
}