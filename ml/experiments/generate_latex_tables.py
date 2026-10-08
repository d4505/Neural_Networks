import os
import json

def generate_latex():
    json_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    models = data["model_benchmarks"]
    langs = data["language_breakdown_f1"]
    ablation = data["ablation_study"]

    latex_content = []
    latex_content.append("% ==========================================================================")
    latex_content.append("% IEEE / ACM Publication Tables: Multilingual Mental Health Journaling NLP")
    latex_content.append("% Generated automatically from empirical benchmark suite")
    latex_content.append("% ==========================================================================\n")

    # ---------------------------------------------------------
    # Table I: Overall Model Benchmark
    # ---------------------------------------------------------
    latex_content.append("% Table I: Overall Model Benchmark Across Paradigms")
    latex_content.append("\\begin{table*}[htbp]")
    latex_content.append("\\caption{Comparative Performance Benchmark Across Classical ML, Sequence Deep Learning, and Transformer Backbones on Multilingual Code-Mixed Reflections}")
    latex_content.append("\\label{tab:overall_benchmark}")
    latex_content.append("\\centering")
    latex_content.append("\\small")
    latex_content.append("\\begin{tabular}{lcccccc}")
    latex_content.append("\\hline")
    latex_content.append("\\textbf{Model Architecture} & \\textbf{Category} & \\textbf{Accuracy (\\%)} & \\textbf{Macro-F1 (\\%)} & \\textbf{Weighted-F1 (\\%)} & \\textbf{Valence MSE} & \\textbf{Latency (ms)} \\\\")
    latex_content.append("\\hline")

    for name, m in models.items():
        is_best = "Proposed" in name and "Full" in name
        acc_str = f"\\textbf{{{m['accuracy']:.1f}}}" if is_best else f"{m['accuracy']:.1f}"
        f1_str = f"\\textbf{{{m['macro_f1']:.1f}}}" if is_best else f"{m['macro_f1']:.1f}"
        wf1_str = f"\\textbf{{{m['weighted_f1']:.1f}}}" if is_best else f"{m['weighted_f1']:.1f}"
        mse_val = m.get("valence_mse", "-")
        mse_str = f"\\textbf{{{mse_val:.3f}}}" if (is_best and isinstance(mse_val, (int, float))) else (f"{mse_val:.3f}" if isinstance(mse_val, (int, float)) else str(mse_val))
        lat_str = f"{m.get('inference_latency_ms', '-'):.1f}" if isinstance(m.get('inference_latency_ms'), (int, float)) else "-"
        
        display_name = name.replace("&", "\\&").replace("_", "\\_")
        latex_content.append(f"{display_name} & {m['model_category']} & {acc_str} & {f1_str} & {wf1_str} & {mse_str} & {lat_str} \\\\")

    latex_content.append("\\hline")
    latex_content.append("\\end{tabular}")
    latex_content.append("\\end{table*}\n")

    # ---------------------------------------------------------
    # Table II: Language & Dialect Breakdown
    # ---------------------------------------------------------
    latex_content.append("% Table II: Dialect & Code-Mix Sub-Group Breakdown")
    latex_content.append("\\begin{table*}[htbp]")
    latex_content.append("\\caption{Dialect & Language Sub-group Performance Comparison (Macro-F1 \\%)}")
    latex_content.append("\\label{tab:language_breakdown}")
    latex_content.append("\\centering")
    latex_content.append("\\small")
    latex_content.append("\\begin{tabular}{lcccccc}")
    latex_content.append("\\hline")
    latex_content.append("\\textbf{Language / Dialect} & \\textbf{Samples} & \\textbf{BERT-base} & \\textbf{mBERT} & \\textbf{IndicBERT} & \\textbf{MuRIL (Single)} & \\textbf{Proposed Antara} \\\\")
    latex_content.append("\\hline")

    for lang, scores in langs.items():
        lang_name = lang.replace("&", "\\&").replace("_", "\\_")
        latex_content.append(
            f"{lang_name} & {scores['samples']} & {scores['BERT-base']:.1f} & {scores['mBERT']:.1f} & {scores['IndicBERT']:.1f} & {scores['MuRIL (Single-Task)']:.1f} & \\textbf{{{scores['Proposed Multi-Task (Antara)']:.1f}}} \\\\"
        )

    latex_content.append("\\hline")
    latex_content.append("\\end{tabular}")
    latex_content.append("\\end{table*}\n")

    # ---------------------------------------------------------
    # Table III: Ablation Study
    # ---------------------------------------------------------
    latex_content.append("% Table III: Component Ablation Study")
    latex_content.append("\\begin{table}[htbp]")
    latex_content.append("\\caption{Ablation Analysis of Proposed Architectural Modules}")
    latex_content.append("\\label{tab:ablation}")
    latex_content.append("\\centering")
    latex_content.append("\\small")
    latex_content.append("\\begin{tabular}{lccc}")
    latex_content.append("\\hline")
    latex_content.append("\\textbf{Architectural Configuration} & \\textbf{Emotion F1} & \\textbf{Valence MSE} & \\textbf{$\\Delta$ F1 (\\%)} \\\\")
    latex_content.append("\\hline")

    for config_name, res in ablation.items():
        c_name = config_name.replace("&", "\\&").replace("_", "\\_")
        is_ref = "Full Proposed" in config_name
        f1_val = f"\\textbf{{{res['emotion_macro_f1']:.1f}}}" if is_ref else f"{res['emotion_macro_f1']:.1f}"
        mse_val = f"\\textbf{{{res['valence_mse']:.3f}}}" if is_ref else f"{res['valence_mse']:.3f}"
        delta_str = res["delta_f1"].replace("%", "\\%")
        latex_content.append(f"{c_name} & {f1_val} & {mse_val} & {delta_str} \\\\")

    latex_content.append("\\hline")
    latex_content.append("\\end{tabular}")
    latex_content.append("\\end{table}\n")

    output_tex_path = os.path.join(os.path.dirname(__file__), "conference_paper_tables.tex")
    with open(output_tex_path, "w", encoding="utf-8") as f:
        f.write("\n".join(latex_content))

    print(f"[SUCCESS] LaTeX tables generated at: {output_tex_path}")

if __name__ == "__main__":
    generate_latex()
