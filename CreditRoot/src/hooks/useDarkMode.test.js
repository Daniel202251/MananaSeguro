import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDarkMode } from "./useDarkMode";

describe("useDarkMode", () => {
  let localStorageMock;
  let matchMediaMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] ?? null),
      setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = String(value);
      }),
      clear: vi.fn(() => {
        localStorageMock.store = {};
      }),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock matchMedia
    matchMediaMock = vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, "matchMedia", {
      value: matchMediaMock,
      writable: true,
    });

    // Reset document.documentElement classList
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
  });

  describe("initialization from localStorage", () => {
    it("initializes dark to true when localStorage 'ms-dark-mode' is 'true'", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("ms-dark-mode");
    });

    it("initializes dark to false when localStorage 'ms-dark-mode' is 'false'", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("ms-dark-mode");
    });

    it("adds 'dark' class to document.documentElement when initialized with dark true", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("does not add 'dark' class to document.documentElement when initialized with dark false", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("fallback to matchMedia", () => {
    it("falls back to matchMedia when localStorage has no stored value, returns true when system prefers dark", () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(true);
      expect(matchMediaMock).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    });

    it("falls back to matchMedia when localStorage has no stored value, returns false when system prefers light", () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(false);
      expect(matchMediaMock).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    });

    it("adds 'dark' class when matchMedia indicates system prefers dark", () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("does not add 'dark' class when matchMedia indicates system prefers light", () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("toggle()", () => {
    it("flips dark from false to true when toggle is called", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.dark).toBe(true);
    });

    it("flips dark from true to false when toggle is called", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.dark).toBe(false);
    });

    it("adds 'dark' class to document root when toggling from false to true", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      const { result } = renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes 'dark' class from document root when toggling from true to false", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      const { result } = renderHook(() => useDarkMode());

      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("handles multiple consecutive toggles correctly", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      const { result } = renderHook(() => useDarkMode());

      expect(result.current.dark).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.dark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.dark).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(false);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.dark).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("localStorage persistence", () => {
    it("writes 'true' to localStorage after toggling to dark mode", () => {
      localStorageMock.store["ms-dark-mode"] = "false";

      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.toggle();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ms-dark-mode", true);
    });

    it("writes 'false' to localStorage after toggling to light mode", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      const { result } = renderHook(() => useDarkMode());

      act(() => {
        result.current.toggle();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ms-dark-mode", false);
    });

    it("persists initial value to localStorage on mount", () => {
      localStorageMock.store["ms-dark-mode"] = "true";

      renderHook(() => useDarkMode());

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ms-dark-mode", true);
    });

    it("persists matchMedia fallback value to localStorage on mount", () => {
      matchMediaMock.mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderHook(() => useDarkMode());

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ms-dark-mode", true);
    });
  });

  describe("return value structure", () => {
    it("returns an object with dark boolean and toggle function", () => {
      const { result } = renderHook(() => useDarkMode());

      expect(result.current).toHaveProperty("dark");
      expect(result.current).toHaveProperty("toggle");
      expect(typeof result.current.dark).toBe("boolean");
      expect(typeof result.current.toggle).toBe("function");
    });
  });
});
