// Two whole files, verbatim, from public repositories, pinned to the commit
// they were read at so the excerpt can never drift from its source.
export const snippets = [
  {
    id: 'ts',
    lang: 'ts',
    repository: 'bgalvandev/starwars-api',
    commit: 'a1c3618cb84871217909e893f48f181f94e98a56',
    path: 'src/presentation/people/dynamo/router.ts',
    code: 'import { Router } from "express";\nimport { DynamoPeopleController } from "./controller";\n\nexport class DynamoPeopleRoutes {\n  static get routes(): Router {\n    const router = Router();\n    const controller = new DynamoPeopleController();\n\n    router.get("/people", controller.getPeopleFromDynamo);\n    router.post("/people", controller.createPerson);\n    router.get("/people/:id", controller.getPersonByIdFromDynamo);\n    return router;\n  }\n}',
  },
  {
    id: 'php',
    lang: 'php',
    repository: 'bgalvandev/idbi-invoice-challenge',
    commit: 'dd57189fcb35ad1d567664208ec2f9235001262e',
    path: 'app/Http/Controllers/Vouchers/GetVouchersHandler.php',
    code: "<?php\n\nnamespace App\\Http\\Controllers\\Vouchers;\n\nuse App\\Http\\Requests\\Vouchers\\GetVouchersRequest;\nuse App\\Http\\Resources\\Vouchers\\VoucherResource;\nuse App\\Services\\VoucherService;\nuse Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;\nuse Illuminate\\Http\\Response;\n\nclass GetVouchersHandler\n{\n    public function __construct(private readonly VoucherService $voucherService) {}\n\n    public function __invoke(GetVouchersRequest $request): AnonymousResourceCollection\n    {\n        $filters = $request->validated();\n        $user = auth()->user();\n\n        $vouchers = $this->voucherService->getVouchers(\n            $request->query('page'),\n            $request->query('paginate'),\n            $filters,\n            $user\n        );\n\n        return VoucherResource::collection($vouchers);\n    }\n}",
  },
] as const;
