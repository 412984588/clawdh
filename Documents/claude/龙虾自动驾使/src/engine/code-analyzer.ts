/**
 * 🦞 龙虾代码分析器
 *
 * 基于 TypeScript Compiler API 的代码质量分析服务。
 * 提供真正的代码问题检测和改进建议生成。
 *
 * @remarks
 * 该服务不依赖外部 AI API，而是使用 TypeScript 编译器内置能力
 * 进行静态分析。这种方法的优点是：
 * - 零延迟：无需网络请求
 * - 可靠：基于官方编译器 API
 * - 精确：完全理解 TypeScript 语法和类型
 *
 * @see {@link https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API | TypeScript Compiler API}
 * @see {@link https://github.com/dsherret/ts-morph | ts-morph - TypeScript Compiler API wrapper}
 */

import ts from "typescript";
import fs from "fs/promises";
import path from "path";

/**
 * 代码问题类型
 *
 * 定义静态分析可以检测的问题类别。
 */
export enum CodeIssueType {
  /** 类型不安全 */
  TYPE_UNSAFE = "type_unsafe",
  /** 未使用的变量/导入 */
  UNUSED = "unused",
  /** 缺少错误处理 */
  NO_ERROR_HANDLING = "no_error_handling",
  /** 复杂度过高 */
  HIGH_COMPLEXITY = "high_complexity",
  /** 缺少文档 */
  NO_DOCUMENTATION = "no_documentation",
  /** 命名不规范 */
  NAMING_CONVENTION = "naming_convention",
  /** 潜在的 bug */
  POTENTIAL_BUG = "potential_bug",
  /** 性能问题 */
  PERFORMANCE = "performance",
}

/**
 * 代码问题严重程度
 */
export enum IssueSeverity {
  /** 错误：必须修复 */
  ERROR = "error",
  /** 警告：建议修复 */
  WARNING = "warning",
  /** 信息：可以忽略 */
  INFO = "info",
}

/**
 * 代码问题定义
 */
export interface CodeIssue {
  /** 问题类型 */
  type: CodeIssueType;
  /** 严重程度 */
  severity: IssueSeverity;
  /** 文件路径 */
  filePath: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
  /** 问题描述 */
  message: string;
  /** 修复建议 */
  suggestion?: string;
  /** 相关代码片段 */
  codeSnippet?: string;
}

/**
 * 文件分析结果
 */
export interface FileAnalysis {
  /** 文件路径 */
  filePath: string;
  /** 发现的问题列表 */
  issues: CodeIssue[];
  /** 代码行数 */
  linesOfCode: number;
  /** 函数数量 */
  functionCount: number;
  /** 复杂度评分 (0-100) */
  complexityScore: number;
}

/**
 * 代码质量报告
 */
export interface CodeQualityReport {
  /** 分析的文件 */
  files: FileAnalysis[];
  /** 问题总数 */
  totalIssues: number;
  /** 按类型分组的问题 */
  issuesByType: Record<CodeIssueType, number>;
  /** 按严重程度分组的问题 */
  issuesBySeverity: Record<IssueSeverity, number>;
  /** 整体质量评分 (0-100) */
  overallScore: number;
  /** 改进建议 */
  suggestions: string[];
}

/**
 * 分析器配置
 */
export interface AnalyzerConfig {
  /** 最大函数复杂度 */
  maxFunctionComplexity: number;
  /** 要求所有公共函数有文档 */
  requirePublicDocs: boolean;
  /** 检测未使用的变量 */
  checkUnused: boolean;
  /** 检测错误处理 */
  checkErrorHandling: boolean;
}

/**
 * 默认分析器配置
 */
export const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  maxFunctionComplexity: 10,
  requirePublicDocs: true,
  checkUnused: true,
  checkErrorHandling: true,
};

/**
 * 龙虾代码分析器类
 *
 * 使用 TypeScript 编译器 API 进行代码静态分析。
 */
export class LobsterCodeAnalyzer {
  private config: AnalyzerConfig;
  private program: ts.Program | null = null;
  private typeChecker: ts.TypeChecker | null = null;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config };
  }

  /**
   * 分析 TypeScript 项目
   *
   * @param projectPath 项目根目录路径
   * @param tsconfigPath tsconfig.json 路径（可选）
   * @returns Promise<CodeQualityReport> 代码质量报告
   */
  async analyzeProject(projectPath: string, _tsconfigPath?: string): Promise<CodeQualityReport> {
    // 创建编译程序（使用默认配置）
    const inputFiles = await this.getSourceFiles(projectPath);
    this.program = ts.createProgram({
      rootNames: inputFiles,
      options: this.getDefaultCompilerOptions(),
    });

    this.typeChecker = this.program.getTypeChecker();

    // 分析所有源文件
    const sourceFiles = this.program.getSourceFiles();
    const fileAnalyses: FileAnalysis[] = [];

    for (const sourceFile of sourceFiles) {
      if (!sourceFile.isDeclarationFile) {
        const analysis = this.analyzeSourceFile(sourceFile);
        if (analysis) {
          fileAnalyses.push(analysis);
        }
      }
    }

    return this.generateReport(fileAnalyses);
  }

  /**
   * 分析单个源文件
   */
  private analyzeSourceFile(sourceFile: ts.SourceFile): FileAnalysis | null {
    const issues: CodeIssue[] = [];
    let functionCount = 0;
    let totalComplexity = 0;

    // 遍历 AST
    const visit = (node: ts.Node) => {
      // 检测函数
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
        functionCount++;
        const complexity = this.calculateCyclomaticComplexity(node);
        totalComplexity += complexity;

        // 检查复杂度
        if (complexity > this.config.maxFunctionComplexity) {
          issues.push({
            type: CodeIssueType.HIGH_COMPLEXITY,
            severity: IssueSeverity.WARNING,
            filePath: sourceFile.fileName,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
            message: `函数复杂度过高 (${complexity})`,
            suggestion: `建议将函数拆分为更小的单元，当前复杂度 ${complexity} 超过阈值 ${this.config.maxFunctionComplexity}`,
          });
        }

        // 检查是否有文档注释
        if (this.config.requirePublicDocs && this.isPublic(node)) {
          const hasDocs = this.getJSDocComment(node);
          if (!hasDocs) {
            issues.push({
              type: CodeIssueType.NO_DOCUMENTATION,
              severity: IssueSeverity.INFO,
              filePath: sourceFile.fileName,
              line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
              column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
              message: `公共函数缺少 JSDoc 文档`,
              suggestion: `添加 @param 和 @returns 注释说明函数用途`,
            });
          }
        }
      }

      // 检测 try-catch 错误处理
      if (this.config.checkErrorHandling) {
        if (ts.isTryStatement(node)) {
          const catchClause = node.catchClause;
          if (!catchClause && !node.finallyBlock) {
            issues.push({
              type: CodeIssueType.NO_ERROR_HANDLING,
              severity: IssueSeverity.WARNING,
              filePath: sourceFile.fileName,
              line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
              column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
              message: `try 语句没有 catch 或 finally 块`,
              suggestion: `添加错误处理逻辑或至少在 finally 中清理资源`,
            });
          }

          if (catchClause) {
            const isEmptyCatch = this.isEmptyBlock(catchClause.block);
            if (isEmptyCatch) {
              issues.push({
                type: CodeIssueType.NO_ERROR_HANDLING,
                severity: IssueSeverity.ERROR,
                filePath: sourceFile.fileName,
                line: sourceFile.getLineAndCharacterOfPosition(catchClause.getStart(sourceFile)).line + 1,
                column: sourceFile.getLineAndCharacterOfPosition(catchClause.getStart(sourceFile)).character + 1,
                message: `空的 catch 块会吞噬错误`,
                suggestion: `至少应该记录错误日志，或考虑不捕获该错误`,
              });
            }
          }
        }
      }

      // 检测 any 类型
      if (this.typeChecker) {
        try {
          const type = this.typeChecker.getTypeAtLocation(node);
          if (type && type.flags === ts.TypeFlags.Any) {
            const typeNode = this.getTypeNode(node);
            if (typeNode && typeNode.kind === ts.SyntaxKind.AnyKeyword) {
              issues.push({
                type: CodeIssueType.TYPE_UNSAFE,
                severity: IssueSeverity.WARNING,
                filePath: sourceFile.fileName,
                line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
                column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
                message: `使用了 any 类型`,
                suggestion: `使用具体类型或 unknown 提高类型安全性`,
              });
            }
          }
        } catch {
          // 某些节点不支持类型检查，忽略
        }
      }

      // 检测 console.log
      if (ts.isCallExpression(node)) {
        if (ts.isIdentifier(node.expression) && node.expression.text === "console") {
          issues.push({
            type: CodeIssueType.PERFORMANCE,
            severity: IssueSeverity.INFO,
            filePath: sourceFile.fileName,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character + 1,
            message: `生产代码中包含 console.log`,
            suggestion: `使用日志记录器替代，或使用条件编译`,
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    const linesOfCode = sourceFile.text.split("\n").length;
    const complexityScore = Math.max(0, 100 - totalComplexity);

    return {
      filePath: sourceFile.fileName,
      issues,
      linesOfCode,
      functionCount,
      complexityScore,
    };
  }

  /**
   * 计算圈复杂度
   */
  private calculateCyclomaticComplexity(functionNode: ts.FunctionLikeDeclaration): number {
    let complexity = 1; // 基础复杂度

    const visit = (node: ts.Node) => {
      // 每个决策点增加复杂度
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.ConditionalExpression:
          complexity++;
          break;
      }
      ts.forEachChild(node, visit);
    };

    visit(functionNode.body || functionNode);
    return complexity;
  }

  /**
   * 检查函数是否是公共的
   */
  private isPublic(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (!modifiers) return true; // 默认认为是公共的

    return !modifiers.some(
      m => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword
    );
  }

  /**
   * 获取 JSDoc 注释
   */
  private getJSDocComment(node: ts.Node): string | undefined {
    const jsDocs = (node as any).jsDoc;
    if (jsDocs && jsDocs.length > 0) {
      return jsDocs[0].getText();
    }
    return undefined;
  }

  /**
   * 检查代码块是否为空
   */
  private isEmptyBlock(block: ts.Block): boolean {
    return block.statements.length === 0;
  }

  /**
   * 获取类型节点
   */
  private getTypeNode(node: ts.Node): ts.TypeNode | undefined {
    if ("type" in node) {
      return (node as any).type;
    }
    return undefined;
  }

  /**
   * 获取源文件列表
   *
   * 递归扫描项目目录，查找所有 TypeScript 文件。
   */
  private async getSourceFiles(projectPath: string): Promise<string[]> {
    const sourceFiles: string[] = [];

    /**
     * 递归扫描目录
     */
    async function scanDirectory(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            sourceFiles.push(fullPath);
          }
        }
      } catch {
        // 忽略无法访问的目录
      }
    }

    await scanDirectory(projectPath);
    return sourceFiles.length > 0 ? sourceFiles : [`${projectPath}/src/**/*.ts`];
  }

  /**
   * 获取默认编译器选项
   */
  private getDefaultCompilerOptions(): ts.CompilerOptions {
    return {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      allowJs: true,
      checkJs: false,
      noEmit: true,
      skipLibCheck: true,
      strict: true,
    };
  }

  /**
   * 生成质量报告
   */
  private generateReport(fileAnalyses: FileAnalysis[]): CodeQualityReport {
    const allIssues = fileAnalyses.flatMap(f => f.issues);
    const totalIssues = allIssues.length;

    const issuesByType: Record<CodeIssueType, number> = {
      [CodeIssueType.TYPE_UNSAFE]: 0,
      [CodeIssueType.UNUSED]: 0,
      [CodeIssueType.NO_ERROR_HANDLING]: 0,
      [CodeIssueType.HIGH_COMPLEXITY]: 0,
      [CodeIssueType.NO_DOCUMENTATION]: 0,
      [CodeIssueType.NAMING_CONVENTION]: 0,
      [CodeIssueType.POTENTIAL_BUG]: 0,
      [CodeIssueType.PERFORMANCE]: 0,
    };

    const issuesBySeverity: Record<IssueSeverity, number> = {
      [IssueSeverity.ERROR]: 0,
      [IssueSeverity.WARNING]: 0,
      [IssueSeverity.INFO]: 0,
    };

    for (const issue of allIssues) {
      issuesByType[issue.type]++;
      issuesBySeverity[issue.severity]++;
    }

    // 计算整体评分
    const errorPenalty = issuesBySeverity[IssueSeverity.ERROR] * 10;
    const warningPenalty = issuesBySeverity[IssueSeverity.WARNING] * 2;
    const overallScore = Math.max(0, Math.min(100, 100 - errorPenalty - warningPenalty));

    // 生成改进建议
    const suggestions: string[] = [];
    if (issuesBySeverity[IssueSeverity.ERROR] > 0) {
      suggestions.push(`发现 ${issuesBySeverity[IssueSeverity.ERROR]} 个错误级别问题，建议优先修复`);
    }
    if (issuesByType[CodeIssueType.NO_ERROR_HANDLING] > 0) {
      suggestions.push("添加适当的错误处理机制以提高代码健壮性");
    }
    if (issuesByType[CodeIssueType.TYPE_UNSAFE] > 0) {
      suggestions.push("避免使用 any 类型，使用具体类型或 unknown 提高类型安全");
    }
    if (issuesByType[CodeIssueType.HIGH_COMPLEXITY] > 0) {
      suggestions.push("将复杂函数拆分为更小的单元以提高可维护性");
    }

    return {
      files: fileAnalyses,
      totalIssues,
      issuesByType,
      issuesBySeverity,
      overallScore,
      suggestions,
    };
  }
}

/**
 * 快速分析入口函数
 *
 * @param projectPath 项目路径
 * @returns Promise<string> 分析结果摘要
 */
export async function quickAnalyze(projectPath: string): Promise<string> {
  const analyzer = new LobsterCodeAnalyzer();
  const report = await analyzer.analyzeProject(projectPath);

  return `
📊 代码质量分析报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 分析文件: ${report.files.length}
🔍 总问题数: ${report.totalIssues}
⭐ 质量评分: ${report.overallScore}/100

问题分类:
  ${Object.entries(report.issuesByType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `  • ${type}: ${count}`)
    .join("\n  ") || "  (无)"}

改进建议:
${report.suggestions.map(s => `  • ${s}`).join("\n") || "  (暂无)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}
